# CLAUDE.md

# Project
Finance Management Tool - Room 1919

Hệ thống quản lý tài chính nội bộ.

## Stack

Frontend:
- Vite
- React
- TypeScript
- TailwindCSS
- Shadcn UI
- Axios
- Zustand

Backend:
- JavaScript
- TypeORM
- PostgreSQL
- JWT Authentication
- bcrypt

Database:
- PostgreSQL
- Database host sẵn trên server
- Không tạo PostgreSQL container mới

Infrastructure:
- Docker
- Docker Compose
- Nginx

---

# Architecture

Browser
↓
Frontend (Vite Docker)
↓
Backend (NestJS Docker)
↓
Remote PostgreSQL Server

---

# Database

PostgreSQL đã tồn tại trên server.

Database:

```txt
finance1919
```

Connection:

```env
DATABASE_URL=postgres://postgres:1@100.98.146.87:5432/finance1919
```

Rules:

- Không tạo PostgreSQL mới
- Không thêm postgres vào docker-compose
- Không dùng SQLite
- Không dùng MySQL
- Không dùng localhost
- Chỉ dùng DATABASE_URL ở trên

---

# Folder

```txt
finance1919/

frontend/
backend/

docker-compose.yml
.env
CLAUDE.md
```

---

# Backend ENV

```env
PORT=8080

JWT_SECRET=finance1919_secret

DATABASE_URL=postgres://postgres:1@100.98.146.87:5432/finance1919
```


---

# Modules

auth

users

categories

transactions

dashboard

reports

---

# Roles

admin

staff

viewer

---

# Commands

Run:

```bash
docker compose up -d --build
```

Logs:

```bash
docker compose logs -f
```

Stop:

```bash
docker compose down
```

Migration:

```bash
docker exec -it finance1919-backend npx prisma migrate deploy
```

---

Mọi code generate phải tuân thủ chính xác file này.