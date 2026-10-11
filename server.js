const express = require('express');
const path = require('path');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Prometheus Registry Setup
const register = new client.Registry();

// Add default metrics (CPU, Memory, Event Loop, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'studyos_'
});

// Custom Prometheus Metrics
const httpRequestCounter = new client.Counter({
  name: 'studyos_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'studyos_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register]
});

// Middleware for metrics collection
app.use((req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const elapsed = process.hrtime(start);
    const durationSeconds = elapsed[0] + elapsed[1] / 1e9;
    const route = req.route ? req.route.path : req.path;

    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status_code: res.statusCode
      },
      durationSeconds
    );
  });

  next();
});

// Health check endpoint (Phase 5)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Prometheus metrics endpoint (Phase 6)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Serve static frontend files (StudyOS)
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for SPA / client-side routing
app.get('*', (req, res, next) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    next();
  }
});

// Start server if executed directly
let server = null;
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyOS production server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Metrics:      http://localhost:${PORT}/metrics`);
  });
}

module.exports = { app, register, server };
