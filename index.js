const slug = require('slug');
const assert = require('assert');

module.exports = ({ total } = { total: process.env.NODE_ENV !== 'production' }) => async (ctx, next) => {
  // attaching timings object to state
  ctx.state.timings = {
    all: new Map(),
    startSpan(spanName) {
      const key = slug(spanName);
      console.log(key);
      assert.ok(!this.all.has(key), 'This span is running already, name muse be unique!');
      this.all.set(key, { start: process.hrtime(), desc: spanName });
      return key;
    },
    stopSpan(spanName) {
      const key = slug(spanName);
      assert.ok(this.all.has(key), 'Span to stop is not found!');
      assert.ok('start' in this.all.get(key), 'Span to stop were never started!');
      const timing = this.all.get(key);
      timing.stop = process.hrtime(timing.start);
    }
  };

  // if we need total, then start it now
  if (total) ctx.state.timings.startSpan('total');

  // letting other things pass now
  await next();

  // Terminate all spans that wasn't explicitely terminated
  ctx.state.timings.all.forEach(timing => { if (!timing.stop) timing.stop = process.hrtime(timing.start); });

  // constructing headers array
  const metrics = [];
  for (const [key, { stop: [ sec, nanosec ], desc }] of ctx.state.timings.all) {
    metrics.push(`${key}=${((sec * 1e9 + nanosec) / 1000000).toFixed(1)}${key !== desc ? `; "${desc}"` : ''}`);
  }

  // Adding our headers now
  if (metrics.length) ctx.append('Server-Timing', metrics.join(', '));
};
