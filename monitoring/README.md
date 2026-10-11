# StudyOS Monitoring Setup

This directory contains the Prometheus monitoring configuration and Grafana dashboards for StudyOS.

## Overview

StudyOS exposes Prometheus metrics natively via `GET /metrics` on port 3000 using `prom-client`.

### Key Metrics Exposed:
- **`up`**: Health status of the StudyOS service (1 = healthy, 0 = unhealthy)
- **`studyos_http_requests_total`**: Counter of all HTTP requests partitioned by HTTP method, route, and status code.
- **`studyos_http_request_duration_seconds`**: Histogram tracking HTTP response duration/latency percentiles (p50, p90, p95, p99).
- **`studyos_process_cpu_seconds_total`**: CPU time consumed by the application process.
- **`studyos_process_resident_memory_bytes`**: RSS memory consumption of the Node.js process.
- **`studyos_nodejs_eventloop_lag_seconds`**: Node.js event loop latency.

## Directory Structure

```
monitoring/
├── prometheus.yml                     # Prometheus scrape configuration
├── README.md                          # Monitoring documentation
└── grafana/
    └── dashboards/
        └── studyos-dashboard.json     # Importable Grafana Dashboard (UID: studyos-mt2-dashboard)
```

## Running with Docker Compose

To start Prometheus alongside StudyOS and Grafana:

```bash
docker compose up -d
```

- Prometheus UI: [http://localhost:9090](http://localhost:9090)
- Grafana UI:    [http://localhost:3001](http://localhost:3001) (Credentials: `admin` / `admin`)
- StudyOS App:   [http://localhost:3000](http://localhost:3000)

## Grafana Dashboard Import

1. Navigate to Grafana at [http://localhost:3001](http://localhost:3001).
2. Go to **Dashboards** > **New** > **Import**.
3. Upload `monitoring/grafana/dashboards/studyos-dashboard.json`.
4. Select the Prometheus data source and click **Import**.
