<div align="center">

# 🐳 Chapter 12: Deployment Guide

**Ship it. Self-host it. Own it.**

</div>

---

[← Architecture](./11-architecture.md) · [Back to Index](./README.md)

---

## Overview

Day at a Glance is designed for self-hosting. The production build uses a multi-stage Docker image that produces a minimal, secure container running a standalone Next.js server.

---

## 🐳 Docker Architecture

The Dockerfile uses a **three-stage build** for an optimized production image:

```
┌───────────────────────────────────────────┐
│  Stage 1: deps                            │
│  node:20-alpine                           │
│  └── npm ci (install dependencies)        │
│      Output: node_modules/               │
├───────────────────────────────────────────┤
│  Stage 2: builder                         │
│  node:20-alpine                           │
│  └── Copy source + node_modules          │
│  └── npm run build                        │
│      Output: .next/standalone + .next/static│
├───────────────────────────────────────────┤
│  Stage 3: runner                          │
│  node:20-alpine                           │
│  └── Copy only standalone build + static  │
│  └── No node_modules, no source code     │
│  └── Non-root user (nextjs:1001)          │
│  └── CMD: node server.js                  │
└───────────────────────────────────────────┘
```

> 💡 The final image contains only the standalone server output — no `node_modules`, no source code, no dev dependencies. This keeps the image small and secure.

---

## 📋 Docker Compose

The recommended way to run in production:

```yaml
version: '3.8'
services:
  day-at-a-glance:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data    # Persistent settings + Excel data
    restart: unless-stopped
```

### Commands

| Command | Purpose |
|---------|---------|
| `docker compose up --build -d` | Build and start (detached) |
| `docker compose down` | Stop and remove container |
| `docker compose down && docker compose up --build -d` | Full rebuild |
| `docker compose logs -f` | Stream container logs |
| `docker compose restart` | Restart without rebuild |

---

## 📂 Volume Mounts

The `/app/data` directory inside the container is the only stateful path:

| Container Path | Host Path | Contents |
|----------------|-----------|----------|
| `/app/data/settings.json` | `./data/settings.json` | User preferences |
| `/app/data/my-day-data.xlsx` | `./data/my-day-data.xlsx` | Dashboard data |

> ⚠️ **Always mount `./data`** as a volume. Without it, settings and imported data are lost when the container restarts.

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `PORT` | `3000` | Server port |
| `HOSTNAME` | `0.0.0.0` | Bind address (important for Docker) |

---

## 🔒 Security

The production image follows security best practices:

| Practice | Implementation |
|----------|---------------|
| **Non-root user** | Runs as `nextjs` (UID 1001) — not root |
| **Minimal image** | Alpine Linux base — smallest attack surface |
| **No source code** | Only the standalone build is copied to the final stage |
| **No dev deps** | `node_modules` not present in production image |
| **Owned data dir** | `/app/data` has correct ownership for the non-root user |
| **No cloud** | All data stays on your machine — nothing leaves the network |

---

## 🌐 Networking

| Property | Value |
|----------|-------|
| **Internal port** | 3000 |
| **Protocol** | HTTP |
| **Bind** | `0.0.0.0` (all interfaces) |
| **Health check** | `GET /` returns HTML |

### Exposing on a Custom Port

Change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"    # Access at http://localhost:8080
```

### Reverse Proxy (Nginx / Caddy)

For HTTPS or custom domains, put a reverse proxy in front:

```
                   HTTPS
Browser ──────────→ Nginx/Caddy ──────────→ localhost:3000
                   (port 443)               (Docker container)
```

<details>
<summary><b>Example Nginx configuration</b></summary>
<br/>

```nginx
server {
    listen 443 ssl;
    server_name dashboard.yourdomain.com;

    ssl_certificate     /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

</details>

---

## 🔄 Update Workflow

When pulling new code or making changes:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild and restart
docker compose down && docker compose up --build -d

# 3. Verify
docker compose logs -f
```

Your `data/` folder is preserved across rebuilds, so settings and imported data remain intact.

---

## 📊 Production Checklist

<table>
<tbody>
<tr>
<td>✅</td>
<td><code>data/</code> directory mounted as volume</td>
</tr>
<tr>
<td>✅</td>
<td>Write permissions on <code>data/</code> for UID 1001</td>
</tr>
<tr>
<td>✅</td>
<td>Port mapping configured (default: 3000)</td>
</tr>
<tr>
<td>✅</td>
<td><code>restart: unless-stopped</code> in Compose (survives reboots)</td>
</tr>
<tr>
<td>✅</td>
<td>Reverse proxy with HTTPS (if publicly exposed)</td>
</tr>
<tr>
<td>✅</td>
<td>Firewall rules (only expose necessary ports)</td>
</tr>
<tr>
<td>✅</td>
<td>Regular backups of <code>data/</code> directory</td>
</tr>
</tbody>
</table>

---

<div align="center">

<br/>

**🎉 You've reached the end of the documentation!**

If you have questions, suggestions, or find issues, please open a GitHub issue.

<br/>

[← Back to Architecture](./11-architecture.md) · [**Return to Documentation Portal →**](./README.md)

<br/>

---

*Crafted by S. Sharma*

[![Made with Next.js](https://img.shields.io/badge/Made_with-Next.js-000?style=flat-square&logo=nextdotjs)](https://nextjs.org/)
[![Self Hosted](https://img.shields.io/badge/Self-Hosted-10b981?style=flat-square)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-First-8b5cf6?style=flat-square)](#)

</div>
