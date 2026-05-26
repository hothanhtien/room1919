# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project
Finance Management Tool - Room 1919

Hệ thống quản lý tài chính nội bộ.

## Stack

Frontend:
- Vite
- React
- TypeScript
- TailwindCSS
- Axios
- Zustand

Backend:
- Node.js
- Express
- TypeORM
- PostgreSQL
- JWT Authentication
- bcryptjs

---

## Architecture

```
Browser
↓
Frontend (Vite Docker) - Port 3000
↓
Backend (Express Docker) - Port 8080
↓
Remote PostgreSQL Server
```

---

## Database

PostgreSQL đã tồn tại trên server.

Database: finance1919
Connection: postgres://postgres:1@100.98.146.87:5432/finance1919

Rules:
- Không tạo PostgreSQL mới
- Chỉ dùng DATABASE_URL ở trên

---

## Folder

```
finance1919/
├── server/           # Express backend
├── client/           # React frontend
├── docker-compose.yml
└── .env
```

---

## Commands

```bash
# Build and run
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down

# Development (without docker)
# Backend
cd server && npm install && npm run dev

# Frontend
cd client && npm install && npm run dev
```

---

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Bills
- GET /api/bills
- POST /api/bills
- GET /api/bills/:id
- POST /api/bills/:id/tick

---

## Modules

- Auth (register, login, JWT)
- Bills (CRUD, tick/untick)
