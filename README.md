StudyOS — DevOps Practices & Principles Project
Project Description
StudyOS is a browser-based "student operating system" — a full-stack front-end web application that brings together task management, notes, a timetable, goal tracking, analytics, a Pomodoro-style focus timer, gamification, and an expense tracker inside a single OS-style desktop interface with draggable, minimizable windows and a taskbar.
This repository is also used as the subject of a DevOps Practices and Principles course project: the goal is to take an existing static web app and wrap it in a full CI/CD and containerized deployment pipeline.
Technologies Used
HTML5
CSS3 (custom properties / design tokens, responsive layout)
Vanilla JavaScript (no frameworks — DOM-driven state management)
`localStorage` for client-side persistence
Project Features
Student Desktop — OS-style dashboard with app icons, taskbar, clock, notifications, and draggable/minimizable/closable windows
Task Manager — add, prioritize, complete, and delete tasks per subject
Notes App — subject-organized notes with search and inline editing
Timetable — click-to-edit weekly class schedule
Goal & Skill Center — goal progress tracking and a skill list with mastery levels
Progress Analytics — study hours, task completion rate, and subject-wise progress charts
Focus Mode — Pomodoro timer and stopwatch with session logging
Gamification — XP, levels, streaks, badges, and daily missions
Expense Tracker — categorized spending against a user-set monthly budget
Universal Search — `Ctrl/Cmd + K` search across tasks, notes, goals, and subjects
How to Run
Locally (no build step required)
Clone the repository:
```bash
   git clone <your-repo-url>
   cd studyos
   ```
Open `index.html` directly in a browser, or serve it with a local dev server (e.g. VS Code's Live Server extension) at `http://127.0.0.1:5500`.
With Docker (once containerized)
```bash
docker build -t studyos .
docker run -p 8080:80 studyos
```
Then visit `http://localhost:8080`.
DevOps Pipeline
This project uses the following tools across its CI/CD and deployment lifecycle:
Stage	Tool
Version control	Git & GitHub
CI (build/test on push)	GitHub Actions
CI/CD orchestration	Jenkins
Containerization	Docker
Local multi-container orchestration	Docker Compose
Deployment	Kubernetes
Monitoring	Prometheus
Planned pipeline flow
```
Push to GitHub → GitHub Actions (lint/build) → Jenkins pipeline
→ Docker image build → Push to registry → Kubernetes deployment
→ Prometheus scrapes metrics for monitoring
```
Project Structure
```
studyos/
├── index.html
├── styles.css
├── app.js
├── Dockerfile          (to be added)
├── docker-compose.yml  (to be added)
├── Jenkinsfile         (to be added)
├── .github/workflows/  (to be added)
├── k8s/                (to be added)
└── README.md
```
Status
✅ Front-end application complete (HTML/CSS/JS)
⬜ Dockerfile & containerization
⬜ GitHub Actions CI workflow
⬜ Jenkins pipeline
⬜ Docker Compose setup
⬜ Kubernetes manifests
⬜ Prometheus monitoring integration