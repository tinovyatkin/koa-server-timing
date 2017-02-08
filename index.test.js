const Koa = require('koa');
const timings = require('./');
const route = require('koa-route');
const sleep = require('sleep');
const request = require('supertest');

const app = new Koa();

app.on('error', (err) => {
  throw err;
});

app.use(timings({ total: true }));

app.use(route.get('/', async (ctx) => {
  ctx.body = 'This is test body';
  sleep.sleep(1);
}));

describe('normal requests', () => {
  let server;
  beforeAll(() => {
    server = app.listen();
  });

  afterAll(() => {
    server.close();
  });

  test('should return Server-Timing with total in header', (done) =>
    request(server)
    .get('/')
    .expect('Server-Timing', /total/)
    .expect(200)
    .end(done)
    );
});
