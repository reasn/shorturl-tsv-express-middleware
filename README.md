ShortURL TSV Express Middleware
===============================
### Comfortably manage your shortURLs with Google Sheets

![Cross-Platform Compatibility](https://apitools.dev/img/badges/os-badges.svg)]
[![License](https://img.shields.io/github/license/reasn/shorturl-tsv-express-middleware)](LICENSE)

Features
--------------------------
- **Minimal maintenance (small, no NPM dependencies)** <br>
It's 107 lines of JavaScript and no external dependencies.

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
    url: "Your TSV file",
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


Contributing
--------------------------
I welcome any contributions, enhancements, and bug-fixes.  [File an issue](https://github.com/reasn/shorturl-tsv-express-middleware/issues) on GitHub and [submit a pull request](https://github.com/reasn/shorturl-tsv-express-middleware/pulls).

License
--------------------------
Swagger Express Middleware is 100% free and open-source, under the [MIT license](LICENSE). Use it however you want.

This package is [Treeware](http://treeware.earth). If you use it in production, then we ask that you [**buy the world a tree**](https://plant.treeware.earth/reasn/shorturl-tsv-express-middleware) to thank us for our work. By contributing to the Treeware forest you’ll be creating employment for local families and restoring wildlife habitats.
