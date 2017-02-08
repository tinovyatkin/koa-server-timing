const assert = require('assert');

function getSlug(str) {
  if (typeof str !== 'string') return '';
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z-]/g, '');
}

module.exports = ({ total } = { total: process.env.NODE_ENV !== 'production' }) => async (ctx, next) => {
  // attaching timings object to state
  ctx.state.timings = {
    all: new Map(),
    startSpan(spanDesc, spanSlug = getSlug(spanDesc)) {
      assert.ok(!this.all.has(spanSlug), 'This span is running already, name muse be unique!');
      assert.ok(spanSlug.length, 'Either slug or description must be non-empy');
      this.all.set(spanSlug, { start: process.hrtime(), desc: spanDesc || '' });
      return spanSlug;
    },
    stopSpan(spanName) {
      const key = this.all.has(spanName) ? spanName : getSlug(spanName);
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
    metrics.push(`${key}=${sec}.${(nanosec / 1000000).toFixed(0).substr(0, 2)}${desc.length && key !== desc ? `; "${desc}"` : ''}`);
  }

  // Adding our headers now
  if (metrics.length) ctx.append('Server-Timing', metrics.join(', '));
};
