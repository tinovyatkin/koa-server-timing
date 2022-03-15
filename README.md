# koa-server-timing

[![Greenkeeper badge](https://badges.greenkeeper.io/tinovyatkin/koa-server-timing.svg)](https://greenkeeper.io/)

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

 Koa 2 [`Server-Timing`](http://wicg.github.io/server-timing/) header middleware.

## Installation

```bash
$ npm install koa-server-timing
```

## API

```js
const Koa = require('koa');
const app = new Koa();
app.use(require('koa-server-timing')({
  total: true, /* default to NODE_ENV !== 'production' */
  convertMetricUnit: time => time * 1000, /* default to time => time */
}));

ctx.state.timings.startSpan('A Task description', 'taskSlug' /* optional, will be created a-task-description, if missed */)

/* ... do some long task to measure here */
ctx.state.timings.stopSpan('A Task description' /* or 'taskSlug' or return from startSpan */);

```

### Options

* `total` where do you want to see total processing time in Server-Timings
* `convertMetricUnit` in what format do you want the serverTimings metrics? (default is seconds)

## Example

```js
const timings = require('koa-server-timing');
const koa = require('koa');
const db = require('./mongoose');
const app = koa();

app.use(timings());

app.listen(3000);

console.log('listening on port 3000');

app.use(async (ctx, next) => {
    ctx.state.timings.startSpan('Query DB for User object');
    const user = await db.User.findOne({ email: 'test@test.com' }).exec();
    ctx.state.timings.stopSpan('Query DB for User object'); // or just pass return of startSpan (it will be a slug)
})

```

### Why

  - Small, no dependencies, 100% test coverage
  - Uses `process.hrtime`, so, no extra timers and very precise

### See also
  - See [`@thomasbrueggemann/node-servertiming`](https://github.com/thomasbrueggemann/node-servertiming) for non-Koa version that uses Timers

## License

  MIT

[npm-image]: https://img.shields.io/npm/v/koa-server-timing.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-server-timing
[github-tag]: http://img.shields.io/github/tag/tinovyatkin/koa-server-timing.svg?style=flat-square
[github-url]: https://github.com/tinovyatkin/koa-server-timing/tags
[travis-image]: https://img.shields.io/travis/tinovyatkin/koa-server-timing.svg?style=flat-square
[travis-url]: https://travis-ci.org/tinovyatkin/koa-server-timing
[coveralls-image]: https://img.shields.io/coveralls/tinovyatkin/koa-server-timing.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/tinovyatkin/koa-server-timing?branch=master
[david-image]: http://img.shields.io/david/tinovyatkin/koa-server-timing.svg?style=flat-square
[david-url]: https://david-dm.org/tinovyatkin/koa-server-timing
[license-image]: http://img.shields.io/npm/l/koa-server-timing.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/koa-server-timing.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/koa-server-timing
[gittip-image]: https://img.shields.io/gittip/tinovyatkin.svg?style=flat-square
[gittip-url]: https://www.gittip.com/tinovyatkin/
