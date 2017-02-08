const Koa = require('koa');
const timings = require('./');
const route = require('koa-route');
const request = require('supertest');

const app = new Koa();

app.on('error', (err) => {
  throw err;
});

app.use(timings({ total: true }));

app.use(route.get('/', async (ctx) => {
  ctx.body = 'This is test body';
  // just waiting for 1000 ms
  await new Promise((resolve) => setTimeout(resolve, 1000));
}));

app.use(route.get('/metric', async (ctx) => {
  ctx.body = 'This is test body 2';
  const slug = ctx.state.timings.startSpan('Another 1s task');
  // just waiting for 1000 ms
  await new Promise((resolve) => setTimeout(resolve, 500));
  ctx.state.timings.stopSpan(slug);
}));

app.use(route.get('/badslug', async (ctx) => {
  ctx.body = 'This is test body 2';
  const slug = ctx.state.timings.startSpan("This's staff To be Converted to slug");
  ctx.state.timings.stopSpan(slug);
}));

describe('normal requests', () => {
  let server;
  beforeAll(() => {
    server = app.listen();
  });

  afterAll(() => {
    server.close();
  });

  test('should return Server-Timing with total in header', async () =>
    await request(server)
    .get('/')
    .expect('Server-Timing', /total/)
    .expect(200)
    );

  test('should return Server-Timing with two metrics and description', async () =>
    request(server)
    .get('/metric')
    .expect('Server-Timing', /total/)
    .expect('Server-Timing', /Another 1s task/)
    .expect(200)
    );

  test('should create correct slugs for Server-Timing metrics', async () =>
    await request(server)
    .get('/badslug')
    .expect('Server-Timing', /total/)
    .expect('Server-Timing', /This's staff To be Converted to slug/)
    .expect('Server-Timing', /thiss-staff-to-be-converted-to-slug/)
    .expect(200)
    );
});
