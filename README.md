# Employee Task Dashboard

A small, responsive task management dashboard built with React and Vite, packaged as a production Docker image that serves the build through Nginx. Tasks are stored in the browser's `localStorage`, so no backend is needed.

**Live URL:** `<add your deployed URL here>`
**Repository:** `<add your GitHub repository URL here>`

## Technologies used

React 18, Vite 5, JavaScript (ES modules), plain CSS, Docker (multi-stage build), Nginx.

## Features

- Dashboard cards for Total, Pending, In Progress and Completed tasks
- Task list with title, description, assignee, priority, status and due date
- Add task form with validation; new tasks appear immediately
- Edit existing tasks
- Delete with a confirmation dialog
- Filter by status and priority, and search by title
- Overdue tasks are highlighted
- Responsive layout: table on desktop and tablet, stacked cards on mobile
- Data persists across refreshes via `localStorage` (starts with four sample tasks)

## Project structure

```
employee-task-dashboard/
├── src/
│   ├── main.jsx        # App entry point
│   ├── App.jsx         # Dashboard, filters, task list, delete confirmation
│   ├── TaskForm.jsx    # Add/Edit modal form
│   └── index.css       # Styles and responsive rules
├── index.html
├── vite.config.js
├── package.json
├── Dockerfile          # Multi-stage build: Node -> Nginx
├── nginx.conf          # Nginx config (SPA fallback, caching, gzip)
├── .dockerignore
└── README.md
```

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build the Docker image

```bash
docker build -t employee-task-dashboard .
```

The first stage (`node:20-alpine`) installs dependencies and runs `npm run build`. The second stage (`nginx:1.27-alpine`) copies only the compiled `dist` folder, so the final image contains no Node.js or source code.

## Run the Docker container

```bash
docker run -d -p 8080:80 --name employee-task-dashboard employee-task-dashboard
```

Open http://localhost:8080. To stop and remove it:

```bash
docker stop employee-task-dashboard && docker rm employee-task-dashboard
```

## Deployment steps

### Option A: Any cloud VM (AWS EC2, DigitalOcean, Azure VM, etc.)

1. Create an Ubuntu VM and open inbound ports 22 and 80 (or 8080) in its firewall/security group.
2. SSH in and install Docker: `curl -fsSL https://get.docker.com | sh`
3. Clone the repository: `git clone <your-repo-url> && cd employee-task-dashboard`
4. Build the image: `docker build -t employee-task-dashboard .`
5. Run it on port 80: `docker run -d -p 80:80 --restart unless-stopped --name employee-task-dashboard employee-task-dashboard`
6. Visit `http://<server-public-ip>`.

### Option B: Container hosting platforms (Render, Railway, Fly.io)

1. Push the repository to GitHub.
2. Create a new web service from the repository and choose the Docker runtime; the platform detects the `Dockerfile`.
3. Set the container port to `80`, deploy, and copy the URL the platform gives you.

Then paste the URL into the **Live URL** line at the top of this README.

## Notes

- Tasks live in each visitor's own browser; clearing site data removes them.
- The Nginx config falls back to `index.html`, so it is ready if routes are added later.
