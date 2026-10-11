const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { app } = require('../server');

test('Server endpoints test suite', async (t) => {
  let server;
  let baseUrl;

  await t.test('setup server', () => {
    return new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  await t.test('GET /health returns HTTP 200 and status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
    assert.ok(typeof data.uptime === 'number');
    assert.ok(data.timestamp);
  });

  await t.test('GET /metrics returns Prometheus metrics', async () => {
    const res = await fetch(`${baseUrl}/metrics`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('studyos_http_requests_total') || text.includes('process_cpu_'));
  });

  await t.test('GET / serves StudyOS frontend index.html', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('StudyOS'));
  });

  await t.test('teardown server', () => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });
});
