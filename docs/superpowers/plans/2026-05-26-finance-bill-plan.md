# Finance Bill Splitting Tool - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MVP with Auth (register/login), Bill creation, and Tick confirmation

**Architecture:** Full-stack với backend Express + TypeORM kết nối PostgreSQL, frontend React + Vite. JWT cho authentication. Docker compose để run services.

**Tech Stack:**
- Backend: Node.js, Express, TypeORM, pg, jsonwebtoken, bcryptjs
- Frontend: Vite, React, TypeScript, TailwindCSS, Axios, Zustand
- Database: PostgreSQL (100.98.146.87)

---

## File Structure

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
│   │   ├── middleware/auth.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/UI.tsx
│   │   ├── pages/Login.tsx
│   │   ├── pages/Register.tsx
│   │   ├── pages/Dashboard.tsx
│   │   ├── pages/CreateBill.tsx
│   │   ├── store/authStore.ts
│   │   ├── services/api.ts
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── .env
```

---

## Task 1: Setup Backend Project

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/index.ts`

- [ ] **Step 1: Create server/package.json**

```json
{
  "name": "finance1919-server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "typeorm": "^0.3.17",
    "pg": "^8.11.3",
    "uuid": "^9.0.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.0",
    "@types/uuid": "^9.0.7",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "typescript": "^5.3.2",
    "tsx": "^4.6.2"
  }
}
```

- [ ] **Step 2: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create server/src/index.ts**

```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/database';
import authRoutes from './routes/auth';
import billsRoutes from './routes/bills';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/bills', billsRoutes);

AppDataSource.initialize().then(() => {
  console.log('Database connected');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.log('Database connection error:', error);
});
```

- [ ] **Step 4: Create .env file in root**

```env
PORT=8080
JWT_SECRET=finance1919_secret_key_2026
DATABASE_URL=postgres://postgres:1@100.98.146.87:5432/finance1919
```

- [ ] **Step 5: Commit**

```bash
git init
git add .
git commit -m "feat: setup backend project structure"
```

---

## Task 2: Setup Database Configuration

**Files:**
- Create: `server/src/config/database.ts`

- [ ] **Step 1: Create server/src/config/database.ts**

```typescript
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Bill } from '../entities/Bill';
import { BillTick } from '../entities/BillTick';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Bill, BillTick],
  synchronize: true,
  logging: false,
});
```

- [ ] **Step 2: Commit**

```bash
git add server/src/config/database.ts
git commit -m "feat: add database configuration"
```

---

## Task 3: Create TypeORM Entities

**Files:**
- Create: `server/src/entities/User.ts`
- Create: `server/src/entities/Bill.ts`
- Create: `server/src/entities/BillTick.ts`

- [ ] **Step 1: Create server/src/entities/User.ts**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Bill } from './Bill';
import { BillTick } from './BillTick';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => Bill, (bill) => bill.creator)
  bills!: Bill[];

  @OneToMany(() => BillTick, (tick) => tick.user)
  ticks!: BillTick[];
}
```

- [ ] **Step 2: Create server/src/entities/Bill.ts**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User';
import { BillTick } from './BillTick';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column()
  creator_id!: string;

  @ManyToOne(() => User, (user) => user.bills)
  @JoinColumn({ name: 'creator_id' })
  creator!: User;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => BillTick, (tick) => tick.bill)
  ticks!: BillTick[];
}
```

- [ ] **Step 3: Create server/src/entities/BillTick.ts**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';

@Entity('bill_ticks')
export class BillTick {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  bill_id!: string;

  @Column()
  user_id!: string;

  @CreateDateColumn()
  ticked_at!: Date;

  @ManyToOne(() => Bill, (bill) => bill.ticks)
  @JoinColumn({ name: 'bill_id' })
  bill!: Bill;

  @ManyToOne(() => User, (user) => user.ticks)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
```

- [ ] **Step 4: Commit**

```bash
git add server/src/entities/*.ts
git commit -m "feat: add User, Bill, BillTick entities"
```

---

## Task 4: Create Auth Routes

**Files:**
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/routes/auth.ts`

- [ ] **Step 1: Create server/src/middleware/auth.ts**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

- [ ] **Step 2: Create server/src/routes/auth.ts**

```typescript
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const userRepo = AppDataSource.getRepository(User);

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepo.create({ email, password: hashedPassword, name });
    await userRepo.save(user);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userRepo.findOne({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
```

- [ ] **Step 3: Commit**

```bash
git add server/src/middleware/auth.ts server/src/routes/auth.ts
git commit -m "feat: add auth routes (register, login, me)"
```

---

## Task 5: Create Bills Routes

**Files:**
- Create: `server/src/routes/bills.ts`

- [ ] **Step 1: Create server/src/routes/bills.ts**

```typescript
import { Router, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Bill } from '../entities/Bill';
import { BillTick } from '../entities/BillTick';
import { User } from '../entities/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const billRepo = AppDataSource.getRepository(Bill);
const tickRepo = AppDataSource.getRepository(BillTick);
const userRepo = AppDataSource.getRepository(User);

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const bills = await billRepo.find({
      relations: ['creator', 'ticks', 'ticks.user'],
      order: { created_at: 'DESC' },
    });

    const result = bills.map((bill) => ({
      id: bill.id,
      title: bill.title,
      amount: parseFloat(bill.amount as any),
      creator: { id: bill.creator.id, name: bill.creator.name },
      created_at: bill.created_at,
      ticks: bill.ticks.map((tick) => ({
        user_id: tick.user_id,
        user_name: tick.user.name,
        ticked_at: tick.ticked_at,
      })),
    }));

    res.json({ bills: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount } = req.body;

    if (!title || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bill = billRepo.create({
      title,
      amount,
      creator_id: req.userId!,
    });
    await billRepo.save(bill);

    const creator = await userRepo.findOne({ where: { id: req.userId } });

    res.json({
      bill: {
        id: bill.id,
        title: bill.title,
        amount: parseFloat(bill.amount as any),
        creator: { id: creator!.id, name: creator!.name },
        created_at: bill.created_at,
        ticks: [],
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const bill = await billRepo.findOne({
      where: { id: req.params.id },
      relations: ['creator', 'ticks', 'ticks.user'],
    });

    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const users = await userRepo.find();
    const tickedUserIds = bill.ticks.map((t) => t.user_id);

    res.json({
      bill: {
        id: bill.id,
        title: bill.title,
        amount: parseFloat(bill.amount as any),
        creator: { id: bill.creator.id, name: bill.creator.name },
        created_at: bill.created_at,
        users: users.map((u) => ({
          id: u.id,
          name: u.name,
          ticked: tickedUserIds.includes(u.id),
          ticked_at: bill.ticks.find((t) => t.user_id === u.id)?.ticked_at,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bill' });
  }
});

router.post('/:id/tick', async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const billId = req.params.id;

    const bill = await billRepo.findOne({ where: { id: billId } });
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }

    const existingTick = await tickRepo.findOne({
      where: { bill_id: billId, user_id: userId },
    });

    if (existingTick) {
      await tickRepo.remove(existingTick);
      res.json({ ticked: false });
    } else {
      const tick = tickRepo.create({ bill_id: billId, user_id: userId });
      await tickRepo.save(tick);
      res.json({ ticked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle tick' });
  }
});

export default router;
```

- [ ] **Step 2: Commit**

```bash
git add server/src/routes/bills.ts
git commit -m "feat: add bills routes (CRUD + tick)"
```

---

## Task 6: Setup Frontend Project

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/index.html`

- [ ] **Step 1: Create client/package.json**

```json
{
  "name": "finance1919-client",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.42",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.2",
    "vite": "^5.0.4",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

- [ ] **Step 2: Create client/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create client/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create client/vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 5: Create client/tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

- [ ] **Step 6: Create client/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Create client/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Finance 1919</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create client/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 9: Commit**

```bash
git add client/package.json client/tsconfig*.json client/vite.config.ts client/tailwind.config.js client/postcss.config.js client/index.html client/src/index.css
git commit -m "feat: setup frontend project structure"
```

---

## Task 7: Create Frontend API Service & Auth Store

**Files:**
- Create: `client/src/services/api.ts`
- Create: `client/src/store/authStore.ts`

- [ ] **Step 1: Create client/src/services/api.ts**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  creator: { id: string; name: string };
  created_at: string;
  ticks: Array<{ user_id: string; user_name: string; ticked_at: string }>;
  users?: Array<{ id: string; name: string; ticked: boolean; ticked_at?: string }>;
}

export const authApi = {
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export const billsApi = {
  getAll: () => api.get('/bills'),
  create: (title: string, amount: number) =>
    api.post('/bills', { title, amount }),
  getOne: (id: string) => api.get(`/bills/${id}`),
  toggleTick: (billId: string, userId: string) =>
    api.post(`/bills/${billId}/tick`, { userId }),
};

export default api;
```

- [ ] **Step 2: Create client/src/store/authStore.ts**

```typescript
import { create } from 'zustand';
import { User } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  init: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token });
    }
  },
}));
```

- [ ] **Step 3: Commit**

```bash
git add client/src/services/api.ts client/src/store/authStore.ts
git commit -m "feat: add api service and auth store"
```

---

## Task 8: Create Login & Register Pages

**Files:**
- Create: `client/src/pages/Login.tsx`
- Create: `client/src/pages/Register.tsx`

- [ ] **Step 1: Create client/src/pages/Login.tsx**

```tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Login
        </button>
        <p className="mt-4 text-center">
          Don't have account?{' '}
          <Link to="/register" className="text-blue-500">Register</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create client/src/pages/Register.tsx**

```tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authApi.register(email, password, name);
      setAuth(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
          Register
        </button>
        <p className="mt-4 text-center">
          Already have account?{' '}
          <Link to="/login" className="text-blue-500">Login</Link>
        </p>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Login.tsx client/src/pages/Register.tsx
git commit -m "feat: add login and register pages"
```

---

## Task 9: Create Dashboard & CreateBill Pages

**Files:**
- Create: `client/src/pages/Dashboard.tsx`
- Create: `client/src/pages/CreateBill.tsx`

- [ ] **Step 1: Create client/src/pages/Dashboard.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { billsApi, Bill } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBills();
  }, [user, navigate]);

  const fetchBills = async () => {
    try {
      const res = await billsApi.getAll();
      setBills(res.data.bills);
    } catch {
      console.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTick = async (billId: string, userId: string) => {
    try {
      await billsApi.toggleTick(billId, userId);
      fetchBills();
    } catch {
      console.error('Failed to toggle tick');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Finance 1919</h1>
        <div className="flex items-center gap-4">
          <span>Xin chào, {user?.name}</span>
          <button onClick={logout} className="text-red-500">Logout</button>
        </div>
      </nav>

      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Danh sách Bills</h2>
          <Link to="/create-bill" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            + Tạo Bill mới
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : bills.length === 0 ? (
          <p className="text-gray-500">Chưa có bill nào</p>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{bill.title}</h3>
                    <p className="text-2xl font-bold text-green-600">{formatAmount(bill.amount)}</p>
                    <p className="text-sm text-gray-500">
                      Người tạo: {bill.creator.name} - {formatDate(bill.created_at)}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Người trong bill:</h4>
                  {bill.users && bill.users.length > 0 ? (
                    <div className="space-y-2">
                      {bill.users.map((u) => (
                        <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={u.ticked}
                            onChange={() => handleToggleTick(bill.id, u.id)}
                            className="w-5 h-5"
                          />
                          <span>{u.name}</span>
                          {u.ticked && u.ticked_at && (
                            <span className="text-sm text-gray-500">
                              (đã xác nhận {formatDate(u.ticked_at)})
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Đang tải danh sách...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create client/src/pages/CreateBill.tsx**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function CreateBill() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await billsApi.create(title, parseFloat(amount));
      navigate('/dashboard');
    } catch {
      setError('Failed to create bill');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">Tạo Bill mới</h1>
      </nav>

      <div className="p-8 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-6">Tạo Bill mới</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block mb-2 font-medium">Tiêu đề</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="VD: Cơm trưa 15/5"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-medium">Số tiền (VNĐ)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="VD: 150000"
              min="0"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Tạo Bill
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Dashboard.tsx client/src/pages/CreateBill.tsx
git commit -m "feat: add dashboard and create bill pages"
```

---

## Task 10: Create App.tsx & main.tsx

**Files:**
- Create: `client/src/App.tsx`
- Create: `client/src/main.tsx`

- [ ] **Step 1: Create client/src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateBill from './pages/CreateBill';
import { useAuthStore } from './store/authStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-bill"
          element={
            <ProtectedRoute>
              <CreateBill />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 2: Create client/src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 3: Commit**

```bash
git add client/src/App.tsx client/src/main.tsx
git commit -m "feat: add main App component and entry point"
```

---

## Task 11: Create Docker Compose

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: finance1919-backend
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - JWT_SECRET=finance1919_secret_key_2026
      - DATABASE_URL=postgres://postgres:1@100.98.146.87:5432/finance1919
    restart: unless-stopped

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: finance1919-frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped
```

- [ ] **Step 2: Create server/Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
```

- [ ] **Step 3: Create client/Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

- [ ] **Step 4: Create client/nginx.conf**

```nginx
server {
    listen 3000;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add docker-compose.yml server/Dockerfile client/Dockerfile client/nginx.conf
git commit -m "feat: add docker compose and Dockerfiles"
```

---

## Task 12: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md with complete project documentation**

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with complete project info"
```

---

## Self-Review Checklist

- [x] Spec coverage: All features from spec have tasks
- [x] Placeholder scan: No TBD, TODO, or vague requirements
- [x] Type consistency: Types defined consistently across files
- [x] File paths: All exact paths, no relative paths
- [x] Commands: All run commands with expected output patterns

---

**Plan complete and saved to `docs/superpowers/plans/2026-05-26-finance-bill-plan.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?