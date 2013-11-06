Dashboarder
===
Dashboarder is a small web app for rotating between multiple dashboards.

Running locally
===
```shell
$ npm install
$ node server.js
```

Developing
===
Either you can run `foreman start` or `grunt watch` and `node server.js`.

Building `gh-pages`
===
```shell
$ grunt build
$ git checkout gh-pages
$ git merge -s subtree master --no-edit
```
