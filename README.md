# EduFlow SaaS — Multi-Tenant School Management System

A full-stack MERN (MongoDB, Express, React, Node.js) school management platform with multi-tenancy, hierarchical RBAC, and JWT authentication with role-based login.

---

## 🏗️ Architecture

```
eduflow-saas/
├── backend/         ← Node.js + Express + MongoDB API
│   ├── config/
│   │   └── database.js
│   ├── src/
│   │   ├── models/       ← Mongoose schemas
│   │   ├── routes/       ← REST API routes
│   │   ├── middleware/   ← JWT auth + tenant scoping
│   │   ├── utils/seed.js ← Demo data seeder
│   │   └── server.js
│   └── .env
└── eduflow/         ← React + Vite + TypeScript frontend
    ├── src/
    │   ├── views/        ← All page views (API-connected)
    │   ├── components/   ← Shared UI components
    │   ├── AuthContext.tsx
    │   ├── NotificationContext.tsx
    │   └── api.ts        ← Centralized fetch wrapper
    └── .env
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas URI

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` (already pre-filled if cloning this repo):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduflow
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Seed the database with demo data:
```bash
npm run seed
```

Start the server:
```bash
npm run dev      # development (nodemon)
npm start        # production
```

API runs at → **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd eduflow
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

App runs at → **http://localhost:5173**

---

## 🔐 Demo Login Credentials

All accounts use the password: **`password123`**

| Role | Email | Subdomain |
|------|-------|-----------|
| Principal | principal@nairobi.edu | nairobi-academy |
| Deputy Principal | deputy@nairobi.edu | nairobi-academy |
| Teacher (Class Teacher) | teacher@nairobi.edu | nairobi-academy |
| Student | student@nairobi.edu | nairobi-academy |
| Parent | parent@nairobi.edu | nairobi-academy |
| Greenwood Principal | principal@greenwood.edu | greenwood |

---

## 🛡️ Multi-Tenancy

Every MongoDB document carries a `schoolId` field. The backend middleware automatically scopes all queries:

```js
// Every protected route injects req.schoolId
Lesson.find({ schoolId: req.user.schoolId })
```

Schools are identified by their **subdomain** at login time. Users with the same email can exist in different schools independently.

---

## 👥 Role-Based Access Control

| Role | Access |
|------|--------|
| **Principal** | Full school access — all data, finance, staff management |
| **Deputy** | Operational — scheduling, discipline, teacher assignments |
| **Teacher** (Class Teacher) | Class-specific — attendance, lesson creation, exam scheduling |
| **Teacher** (Subject) | Lesson creation and grading for assigned subjects |
| **Student** | View lessons, complete lessons, view own exam results |
| **Parent** | View children's progress and fee statements |

---

## 📡 API Reference

All routes require `Authorization: Bearer <token>` except `/api/auth/*`.

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Login (email + password + subdomain + role) |
| POST | `/api/auth/register-school` | Register new school + principal |
| GET  | `/api/auth/me` | Get current user |
| GET  | `/api/auth/school/:subdomain` | Lookup school by subdomain |
| GET  | `/api/dashboard` | Role-specific dashboard stats |
| GET/POST | `/api/users` | List/create users |
| GET  | `/api/users/students` | All students (scoped to school) |
| GET  | `/api/users/teachers` | All teachers |
| GET/POST/PUT/DELETE | `/api/classes` | Manage classes |
| GET  | `/api/classes/:id/students` | Students in a class |
| GET/POST/PUT/DELETE | `/api/lessons` | Manage lessons |
| PATCH | `/api/lessons/:id/complete` | Student marks lesson complete |
| GET/POST/DELETE | `/api/exams` | Manage exams |
| GET/POST | `/api/exams/results` | Exam results |
| GET/POST | `/api/attendance` | View attendance |
| POST | `/api/attendance/bulk` | Save attendance for whole class |
| GET  | `/api/attendance/summary/:classId` | Attendance stats |
| GET/POST | `/api/finance` | Fee records |
| PATCH | `/api/finance/:id/payment` | Record a payment |
| GET/POST | `/api/reminders` | Notifications |
| PATCH | `/api/reminders/:id/read` | Mark reminder read |

---

## 🗄️ Database Models

- **School** — Tenant root (name, subdomain, settings, subscriptionStatus)
- **User** — All roles, bcrypt passwords, per-school unique email index
- **Class** — Linked to school and class teacher
- **Lesson** — With completion tracking per student
- **Exam + ExamResult** — Scheduling and grading
- **Attendance** — Daily per-student records with bulk upsert
- **FeeRecord** — Fee tracking with payment recording
- **Reminder** — Per-user notifications

---

## 🚀 Production Deployment

1. Set `NODE_ENV=production` and a strong `JWT_SECRET`
2. Use MongoDB Atlas for the database URI
3. Deploy backend to Railway / Render / EC2
4. Deploy frontend to Vercel / Netlify with `VITE_API_URL` pointing to backend
5. Configure CORS `FRONTEND_URL` to your production frontend domain
