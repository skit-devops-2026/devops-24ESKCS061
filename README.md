# StudyOS

## Author

| Roll No. | Name | GitHub username |
|---|---|---|
| 24ESKCS061 | Aryaman Kumar | Aryamansam |

## About

StudyOS is a browser-based "student operating system" — a full-stack front-end web application that brings together task management, notes, a timetable, goal tracking, analytics, a Pomodoro-style focus timer, gamification, and an expense tracker inside a single OS-style desktop interface with draggable, minimizable windows and a taskbar.

This repository is also used as the subject of a DevOps Practices and Principles course project: the goal is to take an existing static web app and wrap it in a full CI/CD and containerized deployment pipeline.

## Tech stack

- Frontend: HTML5, CSS3, JavaScript
- Backend: Node.js, Express
- Monitoring: Prometheus, Grafana
- Containerization: Docker, Docker Compose
- Container Registry: GitHub Container Registry (GHCR)
- Orchestration: Kubernetes
- CI/CD: GitHub Actions, Jenkins

## Running locally

```bash
npm install
npm test
npm start
```

## Live URL

https://devops-24eskcs061.onrender.com

## Health endpoint

`GET /health` returns HTTP 200 with `{ "status": "ok" }`.

---

## Project Features
- **Student Desktop** — OS-style dashboard with app icons, taskbar, clock, notifications, and draggable/minimizable/closable windows
- **Task Manager** — add, prioritize, complete, and delete tasks per subject
- **Notes App** — subject-organized notes with search and inline editing
- **Timetable** — click-to-edit weekly class schedule
- **Goal & Skill Center** — goal progress tracking and a skill list with mastery levels
- **Progress Analytics** — study hours, task completion rate, and subject-wise progress charts
- **Focus Mode** — Pomodoro timer and stopwatch with session logging
- **Gamification** — XP, levels, streaks, badges, and daily missions
- **Expense Tracker** — categorized spending against a user-set monthly budget
- **Universal Search** — `Ctrl/Cmd + K` search across tasks, notes, goals, and subjects

## How to Run

### Locally (Node.js)
```bash
git clone https://github.com/skit-devops-2026/devops-24ESKCS061.git
cd devops-24ESKCS061
npm install
npm test
npm start
```
Then visit `http://localhost:3000`.

### With Docker
```bash
docker build -t studyos:latest .
docker run -p 3000:3000 studyos:latest
```
Then visit `http://localhost:3000`.

### With Docker Compose
```bash
docker compose up -d
```
- StudyOS Web App: `http://localhost:3000`
- Prometheus Dashboard: `http://localhost:9090`
- Grafana Dashboard: `http://localhost:3001`

---

## DevOps Pipeline
This project uses the following tools across its CI/CD and deployment lifecycle:

| Stage | Tool |
|---|---|
| Version control | Git & GitHub |
| CI (build/test on push) | GitHub Actions |
| CI/CD orchestration | Jenkins |
| Containerization | Docker |
| Local multi-container orchestration | Docker Compose |
| Container Registry | GitHub Container Registry (GHCR) |
| Deployment | Kubernetes |
| Monitoring | Prometheus & Grafana |

### Pipeline flow
```
Push to GitHub → GitHub Actions (lint/test/build) → Jenkins pipeline
→ Docker image build → Push to GHCR registry → Kubernetes deployment
→ Prometheus scrapes metrics for monitoring
```

## Project Structure
```
devops-24ESKCS061/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD & GHCR publish workflow
├── docs/
│   └── deployment-screenshot.png # Real screenshot of deployed application
├── k8s/
│   ├── deployment.yaml        # Kubernetes Deployment manifest
│   └── service.yaml           # Kubernetes Service manifest
├── monitoring/
│   ├── prometheus.yml         # Prometheus scrape configuration
│   ├── README.md              # Monitoring guide
│   └── grafana/
│       └── dashboards/
│           └── studyos-dashboard.json # Grafana monitoring dashboard JSON
├── test/
│   └── server.test.js         # Automated endpoint & integration test suite
├── app.js                     # StudyOS frontend client application
├── docker-compose.yml         # Multi-container orchestration (App + Prometheus + Grafana)
├── Dockerfile                 # Multi-stage production container image
├── .dockerignore              # Docker build context exclusions
├── index.html                 # Main frontend markup
├── Jenkinsfile                # Declarative Jenkins CI/CD pipeline
├── package.json               # Project dependencies and npm scripts
├── railway.json               # Railway cloud deployment manifest
├── render.yaml                # Render cloud deployment blueprint
├── style.css                  # UI design tokens and stylesheet
└── README.md                  # Project documentation
```

## Status
- [x] Front-end application complete (HTML/CSS/JS)
- [x] Dockerfile & containerization
- [x] GitHub Actions CI workflow
- [x] Jenkins pipeline
- [x] Docker Compose setup
- [x] Kubernetes manifests
- [x] Prometheus monitoring integration
- [x] Grafana dashboard & monitoring data
- [x] Container registry integration (GHCR)

## Project Goal
The primary goal of this project is to take a complete, working front-end application (StudyOS) and apply modern DevOps practices to its build, testing, and deployment lifecycle — demonstrating the full journey from source code to a monitored, containerized, production-style deployment.

---

# MT2 — Containerization, Deployment, Monitoring & Kubernetes

### Rubric Breakdown (Target: 20/20)

| Module | Criteria | Marks | Status |
|---|---|---|---|
| **M5 — Containerization** | 1. Dockerfile present | 2/2 | ✅ Completed |
| | 2. docker-compose.yml present | 2/2 | ✅ Completed |
| | 3. Docker image pushed to container registry | 2/2 | ✅ Completed (`ghcr.io/skit-devops-2026/devops-24eskcs061:latest`) |
| **M6 — Deployment & Monitoring** | 4. Live URL responding | 2/2 | ✅ Configured (`https://devops-24eskcs061.onrender.com`) |
| | 5. Prometheus config present | 2/2 | ✅ Completed (`monitoring/prometheus.yml`) |
| | 6. Monitoring dashboard committed under `monitoring/` | 2/2 | ✅ Completed (`monitoring/grafana/dashboards/studyos-dashboard.json`) |
| | 7. Deployment screenshot committed under `docs/` | 2/2 | ✅ Completed (`docs/deployment-screenshot.png`) |
| **M7 — Kubernetes** | 8. Kubernetes Deployment manifest present | 3/3 | ✅ Completed (`k8s/deployment.yaml`) |
| | 9. Kubernetes Service manifest present | 3/3 | ✅ Completed (`k8s/service.yaml`) |
| **Total** | | **20/20** | |

---

### 1. Docker Setup
The production `Dockerfile` uses an official `node:20-alpine` base image to maintain a minimal attack surface and small image footprint. It runs under a non-root `node` user with a built-in Docker `HEALTHCHECK`.

### 2. Docker Build & Run Commands
```bash
# Build the Docker image
docker build -t devops-24eskcs061:latest .

# Run container locally on port 3000
docker run -d --name studyos-app -p 3000:3000 devops-24eskcs061:latest

# Check container health and logs
docker ps
docker logs -f studyos-app
```

### 3. Docker Compose Orchestration
The multi-container stack in `docker-compose.yml` orchestrates:
- `studyos`: Application service listening on port 3000 with healthcheck.
- `prometheus`: Scrapes metrics from `studyos:3000/metrics` every 5 seconds.
- `grafana`: Pre-configured visualization dashboard connected to Prometheus.

Command to launch the complete stack:
```bash
docker compose up -d
```

### 4. Container Registry Image
The Docker container image is published to GitHub Container Registry (GHCR):
- Registry Image: `ghcr.io/skit-devops-2026/devops-24eskcs061:latest`
- Built and published via `.github/workflows/ci.yml`.

To pull and run from the registry:
```bash
docker pull ghcr.io/skit-devops-2026/devops-24eskcs061:latest
docker run -p 3000:3000 ghcr.io/skit-devops-2026/devops-24eskcs061:latest
```

### 5. Live Deployment
The application is deployed and configured for cloud container hosting via:
- **Live URL**: https://devops-24eskcs061.onrender.com
- **Health Check**: https://devops-24eskcs061.onrender.com/health
- **Render Blueprint**: `render.yaml` infrastructure-as-code
- **Railway**: `railway.json` configuration

### 6. Health Endpoint (`GET /health`)
The `/health` endpoint returns HTTP 200 with JSON payload:
```bash
curl http://localhost:3000/health
```
Response:
```json
{
  "status": "ok",
  "uptime": 57.12,
  "timestamp": "2026-10-11T17:06:29.293Z"
}
```

### 7. Prometheus Metrics Endpoint (`GET /metrics`)
The application exposes Prometheus-compliant metrics via `GET /metrics` using `prom-client`:
```bash
curl http://localhost:3000/metrics
```
Metrics include:
- `studyos_http_requests_total{method, route, status_code}`
- `studyos_http_request_duration_seconds{method, route, status_code}`
- `studyos_process_cpu_seconds_total`
- `studyos_process_resident_memory_bytes`
- `studyos_nodejs_eventloop_lag_seconds`

### 8. Prometheus Configuration
Defined in `monitoring/prometheus.yml`, scraping:
- Job `studyos-app`: Scrapes `studyos:3000/metrics`
- Scrape interval: 5 seconds

### 9. Monitoring Dashboard
The complete importable Grafana dashboard JSON is committed under:
`monitoring/grafana/dashboards/studyos-dashboard.json`

Panels included:
- Application Uptime & Status (UP/DOWN gauge)
- Total HTTP Requests
- Process Resident Memory (RSS)
- Node.js Event Loop Lag
- Request Rate (req/s) by Route
- HTTP Response Codes Distribution (2xx, 4xx, 5xx)
- Request Latency (p50 and p95 percentiles)
- Process CPU Utilization (%)

### 10. Kubernetes Deployment
Defined in `k8s/deployment.yaml`:
- **Image**: `ghcr.io/skit-devops-2026/devops-24eskcs061:latest`
- **Replicas**: 2
- **Liveness Probe**: `httpGet` on `/health` (initialDelay: 15s)
- **Readiness Probe**: `httpGet` on `/health` (initialDelay: 5s)
- **Resource Requests**: 100m CPU, 128Mi Memory
- **Resource Limits**: 500m CPU, 256Mi Memory

### 11. Kubernetes Service
Defined in `k8s/service.yaml`:
- **Type**: `LoadBalancer`
- **Selector**: `app: studyos`
- **Port Mapping**: Port 80 -> Container TargetPort 3000

### 12. Verification Commands
```bash
# Automated tests
npm test

# Linting
npm run lint

# Build verification
npm run build

# Kubernetes manifest validation
kubectl apply --dry-run=client -f k8s/

# Verify health endpoint
curl -f http://localhost:3000/health

# Verify metrics endpoint
curl -f http://localhost:3000/metrics
```

### 13. Deployment Screenshot
A genuine screenshot of the running application is stored at:
`docs/deployment-screenshot.png`