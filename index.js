const https = require('https');

const MAX_OPEN_REQUESTS = 5;

function prepareOptions ({
    url,
    request,
    onError,
    preventAutoStart,
    updateRoute,
    log
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
    }
};

function parse(rawData) {
    return rawData.split('\n').reduce(
    (acc, line) => {
        const parts = line.split('\t');
        return {
            ...acc,
            [parts[0]]: parts[1],
        };
    },
    {});
}

function createUpdate({url, request, onError, log}, state) {
    return callback => {
        log('Updating redirects...');
        if(state.openRequests >= MAX_OPEN_REQUESTS) {
            onError(`Cannot run more than ${MAX_OPEN_REQUESTS} requests concurrently. Check if interval is too small or requests fail.`);
            return;
        }
        state.openRequests++;

        request(url, res => {
        if (res.statusCode !== 200) {
            // Consume response data to free up memory
            res.resume();
            onError(new Error(`Request Failed. Status Code: ${statusCode}`));
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
        }).on('error', onError);
    }
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

        let redirect = Object.keys(state.redirects).find(url => req.url === `/${url}/` || req.url === `/${url}`);

        // Allow setting of default redirect for "/".
        if(!redirect && req.url === '' || req.url === '/' && state.redirects['/']) {
            redirect = '/';
        }

        if(redirect) {
            options.log(`Redirecting (${redirect})`);
            res.writeHead(302, {
                Location: state.redirects[redirect],
            });
            res.end();
            return;
        }

        next();
    };

    middleware.update = createUpdate(options, state);
    middleware.stop = () => clearInterval(interval);
    middleware.start = () => {
        
        middleware.update();
        const interval = setInterval(middleware.update, options.interval);
        interval.unref();
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