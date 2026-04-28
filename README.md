# TaskFlow

A mini-SaaS task management application featuring secure authentication, per-user task management, real-time dashboard insights, and a polished modern UI.

Built as part of a **Full Stack Developer Intern screening assignment**.

---

## 🌐 Live Demo

- **Frontend:** https://product-space-assignment.vercel.app  
- **Backend:** https://product-space-assignment-qngn.onrender.com  

---

## 🔐 Demo Account

Use the built-in demo account:

- **Email:** `demo@taskflow.app`  
- **Password:** `demo1234`  

Or click **“Try Demo Account”** on the login page.

> Demo data is automatically seeded on server start.

---

## 📁 Project Structure

Task-Master-Pro/
├── server/ Express + Drizzle + SQLite backend
├── client/ React + Vite + Tailwind frontend

## Tech stack

- **Backend:** Node.js, Express 5, Drizzle ORM, PostgreSQL, bcryptjs, jsonwebtoken, Zod
- **Frontend:** React 19, Vite, Tailwind v4, shadcn/ui, TanStack Query, React Hook Form, Framer Motion, wouter
- **Tooling:** TypeScript, tsx, drizzle-kit

## ✨ Features Implemented

### 🔐 Authentication
- Secure signup & login
- JWT-based authentication
- Password hashing using bcrypt

### 📝 Task Management
- Create, update, delete tasks
- Status tracking (pending/completed)
- Priority management (low/medium/high)
- Per-user task isolation

### 📊 Dashboard
- Task summary statistics
- Filter by status, priority, search
- Real-time updates using React Query

### 🎨 UI/UX
- Responsive design (mobile-first)
- Smooth animations (Framer Motion)
- Clean, modern interface (shadcn + Tailwind)

### 🌐 API
- RESTful API design
- Protected routes using JWT
- Input validation using Zod
## Run it locally (3 steps)

### Prerequisites

- **Node.js 20 or 22** ([nodejs.org](https://nodejs.org))
- **PostgreSQL 14+** running locally (or any Postgres URL — Neon, Supabase, etc.)

### 1. Install everything

```bash
npm run install:all
```

### 2. Configure the database

Create an empty database, e.g.:

```bash
createdb taskflow
```

Then create `server/.env` (copy `server/.env.example`):

```bash
cp server/.env.example server/.env
```

Edit `server/.env` to point `DATABASE_URL` at your database, e.g.:

```
PORT=3000
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/taskflow
SESSION_SECRET=any-long-random-string
```

Push the schema:

```bash
npm run db:push
```

### 3. Run the app

```bash
npm run dev
```

Then open **http://localhost:5173** and click **"Try the demo account"**.

`npm run dev` starts both the API server (port 3000) and the Vite dev
server (port 5173) together. Vite proxies `/api/*` to the backend
automatically.

## Useful scripts

| Command | What it does |
| --- | --- |
| `npm run install:all` | Installs root + server + client deps |
| `npm run db:push` | Pushes the Drizzle schema to your database |
| `npm run dev` | Runs server + client together |
| `npm run build` | Type-checks and builds both for production |
| `npm run start` | Runs the server in production mode |

## API reference

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | — | Create account, returns JWT + user |
| POST | `/api/auth/login` | — | Log in, returns JWT + user |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/tasks` | JWT | List tasks (filters: `status`, `priority`, `search`) |
| POST | `/api/tasks` | JWT | Create a task |
| PATCH | `/api/tasks/:id` | JWT | Update a task |
| DELETE | `/api/tasks/:id` | JWT | Delete a task |
| GET | `/api/stats/summary` | JWT | Dashboard stats |
| GET | `/api/healthz` | — | Liveness probe |

## How the database connects

`server/src/db.ts` reads `DATABASE_URL` from your `.env` and creates a single
`pg.Pool` wrapped by Drizzle ORM. All queries are typed against the schema
in `server/src/schema/`. Schema changes are pushed with `drizzle-kit push`
(no separate migrations needed for development).
