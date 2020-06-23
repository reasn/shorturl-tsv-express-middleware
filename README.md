ShortURL TSV Express Middleware
===============================
### Comfortably manage your shortURLs with Google Sheets

![Cross-Platform Compatibility](https://apitools.dev/img/badges/os-badges.svg)
[![License](https://img.shields.io/github/license/reasn/shorturl-tsv-express-middleware)](LICENSE)
[![Buy us a tree](https://img.shields.io/badge/Treeware-%F0%9F%8C%B3-lightgreen)](https://plant.treeware.earth/reasn/shorturl-tsv-express-middleware)

Features
--------------------------
- **Minimal maintenance (small, single NPM dependency)** <br>
It's 139 simple lines of JavaScript and one dependency to `parseurl` which comes with `express`.

- **Manage your shortURLs with Google Sheets**<br>
No additional persistence needed, set permissions, use formulas and create your own user interfaces.

Installation and Use
--------------------------
Install using [npm](https://docs.npmjs.com/about-npm/).

```bash
npm install @reasn/shorturl-tsv-express-middleware --save
```
Then use it in your [Node.js](http://nodejs.org/) script like this:

```javascript
const express = require('express');
const app = express();  
const createMiddleware = require('./index');

let server;

app.use(createMiddleware({
    url: "URL to your TSV file",
    onError: error => {
        console.error(error);
        server.close();
    }
}));

server = app.listen(process.env.PORT || 3000);

```

Use Google Sheets as management interface
--------------------------
* Make sure you have a Google account.
* Create a new Google Sheet by going to [sheet.new](https://sheet.new).
* Enter shortUrls in the first columns and the targets to redirect to in the second column.
* Select `File` > `Publish to the web` to open a dialog box headlined `Publish to the web`.
* Make sure `Link` is selected (not `Embed`).
* Select `Sheet1` (not `Entire Document`) in the first drop-down.
* Select `Tab-separated values (.tsv)` in the second drop-down.
* Make sure to uncheck `Require viewers to sign in ...`.
* Make sure to check `Automatically republish when changes are made`.
* Copy the url to your newly published file and use it in your script as options.url

Runtime Configuration
--------------------------

Below is an example with all possible `options` parameters.

```javascript
app.use(createMiddleware({
    url, // The URL to your TSV file
    onError, // error handler (`error => undfined`)
    request, //request || https.get,
    interval, // Interval to fetch updates, default: 1000 * 60 * 5, i.e. 5 minutes
    preventAutoStart, // Unless set to true, the regular fetching of updates is starts when invoking createMiddleware(), default: false
    updateRoute, // Exposes a route to force updates via GET request. This can be used for a reflected (D)DOS. Check whether that's a threat before using.
    log, // log message handler (`message => undefined`)
    maxOpenRequests, // The number of possible open requests to fetch updates, default: 5
    maxHops, // The number of redirect lookups before assuming a circular redirect, default: 50
    };
}));

server = app.listen(process.env.PORT || 3000);

```


Contributing
--------------------------
I welcome any contributions, enhancements, and bug-fixes.  [File an issue](https://github.com/reasn/shorturl-tsv-express-middleware/issues) on GitHub and [submit a pull request](https://github.com/reasn/shorturl-tsv-express-middleware/pulls).

License
--------------------------
Swagger Express Middleware is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/reasn/shorturl-tsv-express-middleware) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.
