# Finance Bill Splitting Tool - Design Spec

**Date:** 2026-05-26
**Project:** Tool_Mana_1919

---

## Overview

Hệ thống quản lý chia bill nội bộ. Một người tạo bill (title + số tiền), những người còn lại tick để xác nhận đã thanh toán.

## Stack

- **Frontend:** Vite + React + TypeScript + TailwindCSS
- **Backend:** Node.js + Express + TypeORM + JWT
- **Database:** PostgreSQL (100.98.146.87:5432/finance1919)

## Architecture

```
Browser → Vite (Client) → Express (Server) → PostgreSQL
```

## Folder Structure

```
finance1919/
├── server/
│   ├── src/
│   │   ├── config/database.ts
│   │   ├── entities/User.ts
│   │   ├── entities/Bill.ts
│   │   ├── entities/BillTick.ts
│   │   ├── routes/auth.ts
│   │   ├── routes/bills.ts
│   │   └── index.ts
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/Login.tsx
│   │   ├── pages/Register.tsx
│   │   ├── pages/Dashboard.tsx
│   │   ├── pages/CreateBill.tsx
│   │   ├── store/authStore.ts
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
└── .env
```

## Database Schema

### Users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique, NOT NULL |
| password | VARCHAR(255) | Bcrypt hash |
| name | VARCHAR(255) | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Bills
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| title | VARCHAR(255) | NOT NULL |
| amount | DECIMAL(10,2) | NOT NULL |
| creator_id | UUID | FK → users.id |
| created_at | TIMESTAMP | DEFAULT NOW() |

### Bill_Ticks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | Primary key |
| bill_id | UUID | FK → bills.id |
| user_id | UUID | FK → users.id |
| ticked_at | TIMESTAMP | DEFAULT NOW() |
| | | UNIQUE(bill_id, user_id) |

## API Endpoints

### Auth
```
POST /api/auth/register
  Body: { email, password, name }
  Response: { user, token }

POST /api/auth/login
  Body: { email, password }
  Response: { user, token }
```

### Bills
```
GET /api/bills
  Headers: Authorization: Bearer <token>
  Response: { bills: [...] }

POST /api/bills
  Headers: Authorization: Bearer <token>
  Body: { title, amount }
  Response: { bill }

GET /api/bills/:id
  Response: { bill, ticks: [...], users: [...] }

POST /api/bills/:id/tick
  Headers: Authorization: Bearer <token>
  Body: { userId }
  Response: { ticked: boolean }
```

## User Roles

- **Admin/Staff**: Tạo bill, tick, xem tất cả bills
- **Tất cả users**: Đăng ký, đăng nhập, tick/trong bill

## UI Screens

1. **Login** - Email + Password form
2. **Register** - Email + Password + Name form
3. **Dashboard** - Danh sách bills:
   - Mỗi bill: title, amount, người tạo, danh sách users với checkbox tick
   - Nút tạo bill mới
4. **Create Bill** - Form: title, amount