const https = require('https');

function prepareOptions ({
    url,
    request,
    onError,
    preventAutoStart,
    updateRoute,
    log,
    maxHops,
    maxOpenRequests,
}) {

    if(typeof url !== 'string') {
        throw new Error('options.url must be the url of a valid tsv file');
    }
    if(typeof onError !== 'function') {
        throw new Error('options.onError is called when asynchronous data fetching fails and must be a function.');
    }
    return {
        url,
        request: request || https.get,
        interval: 1000 * 60 * 5, // 5 minutes
        onError,
        preventAutoStart: !!preventAutoStart,
        updateRoute: updateRoute,
        log: log || (message => undefined),
            maxOpenRequests: maxOpenRequests > 0
                         ? maxOpenRequests
                         : 5,
        maxHops: maxHops > 0
                 ? maxHops
                 : 50,
    };
};

function parse(rawData) {
    return rawData.split('\n').reduce(
    (acc, line) => {
        const parts = line.split('\t').map(s => s.trim());
        return {
            ...acc,
            [parts[0]]: parts[1],
        };
    },
    {});
}

function createUpdate(
    {
        url,
        request,
        onError,
        log,
        maxOpenRequests
    },
    state
    ) {
    return callback => {
        log('Updating redirects...');
        if(state.openRequests >= maxOpenRequests) {
            onError(`Cannot run more than ${maxOpenRequests} requests concurrently. Check if interval is too small or requests fail.`);
            return;
        }
        state.openRequests++;

        const handleResponse = res => {
            
            if (res.statusCode !== 200) {
                // Consume response data to free up memory
                res.resume();
                onError(new Error(`Update request Failed. Status Code: ${res.statusCode}`));
                return;
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', chunk => { rawData += chunk; });
            res.on('end', () => {
                try {
                    log('Parsing');
                    state.redirects = parse(rawData);
                    state.openRequests--;
                    const count = Object.keys(state.redirects).length;
                    if(count < 10) {
                        log(state.redirects);
                    }
                    log(`Update successful (${count} redirects).`);
                    if(typeof callback === 'function') {
                        callback(state.redirects);
                    }
                } catch (e) {
                    onError(e);
                    return;
                }
            });
        }

        // Repeat request if the server asks for a redirect
        request(url, res => 
            [301, 302, 303, 307, 308].includes(res.statusCode)
            ? request(res.headers.location, handleResponse).on('error', onError)
            : handleResponse(res)
        ).on('error', onError);
    }
}

function find(redirects, url) {
    const redirect = Object.keys(redirects).find(candidate => url === `/${candidate}/` || url === `/${candidate}`);
    return redirects[redirect];
}

function create(options) {
    
    const state = {
        redirects: {},
        openRequests: 0,
    }

    const middleware = function(req, res, next) {

        if(req.url === `/${options.updateRoute}/` || req.url === `/${options.updateRoute}`) {
            options.log(`Update triggered via updateRoute.`);
            middleware.update(() => res.send('Redirects updated.'));
            return;
        }

        // Allow setting of default redirect for "/".
        const url = req.url === ''
                    ? '/'
                    : req.url;
        let target = find(state.redirects, req.url);

        let hops = options.maxHops;
        while(target && target.startsWith('/')) {
            target = find(state.redirects, target);
            if(--hops > 0) {
                res.status(500)
                res.send(
                    `Stopped after ${options.maxHops} hops, `
                    // Filters out most characters to prevent injection attacks
                    + `detected possible circular redirect for ` + url.replace(/[^\w/-]+/g, '?')
                );
                return;
            }
        }

        if(target) {
            options.log(`Redirecting (${url})`);
            res.writeHead(302, {
                Location: target,
            });
            res.end();
            return;
        }

        next();
    };

    middleware.update = createUpdate(options, state);
    middleware.stop = () => undefined;
    middleware.start = () => {
        middleware.update();
        const interval = setInterval(middleware.update, options.interval);
        interval.unref();
        middleware.stop = () => clearInterval(interval);
    };

    if(!options.preventAutoStart) {
        middleware.start();
    }
    
    return middleware;
}

function createMiddleware(options) {
    return create(prepareOptions(options));
}

module.exports = createMiddleware;