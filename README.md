# LabourForce HRMS

A full-stack HR Management System built for the construction industry — managing site workers, overtime tracking, and payroll.

**Stack:** React (frontend) + Node.js/Express (backend) + MongoDB Atlas (database)

**HRMS Choice:** Built from scratch (not forked) — chose this approach because the suggested MERN repo had outdated dependencies and MySQL setup overhead. A clean build with MongoDB Atlas gives zero local DB install for reviewers.

**AI Tools Used:**
- Claude (Anthropic) — for code scaffolding, validation logic, CSS design system, and debugging edge cases
- I wrote and reviewed every line; can explain any part during interview

---

## 🚀 Setup (Run Locally in 5 Minutes)

### Prerequisites
- Node.js v18+ installed
- A free MongoDB Atlas account (for your own DB) OR use the deployed backend

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/hrms-project.git
cd hrms-project
```

---

### Step 2 — Backend Setup

**Option A: Use the already-deployed backend on Render (easiest)**
Skip to Step 3 and set `REACT_APP_API_URL` to the Render URL.

**Option B: Run backend locally**

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

To get your MongoDB Atlas URI:
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Click Connect → Drivers → copy the connection string
4. Replace `<password>` with your DB user password

Start backend:
```bash
npm start
# Server will say: MongoDB connected successfully
```

---

### Step 3 — Frontend Setup

```bash
cd frontend
```

Create a `.env` file in the `frontend/` folder:
```
REACT_APP_API_URL=http://localhost:5000
```

If using Render deployed backend, use:
```
REACT_APP_API_URL=https://YOUR_RENDER_URL.onrender.com
```

Install and run:
```bash
npm install
npm start
```

App opens at **http://localhost:3000** ✅

---

## Features Built

### Part 1 — Overtime Entry & Approval (New Feature)
- Select worker from existing employee list
- Enter date, overtime hours (1–6), and reason
- Full frontend validation before submission
- Full backend validation on API (duplicate check, monthly 60h cap, worker existence)
- Approve / Reject overtime entries from the list
- Error messages shown clearly for each validation failure

### Part 2 — Ticket Fixes

| Ticket | Fix |
|--------|-----|
| LF-101 | All dates display as DD/MM/YYYY (Indian format) across payslip and overtime list |
| LF-102 | Salary field validated — must be > 0, both frontend + backend |
| LF-103 | Designation dropdown added (Mason / Electrician / Plumber / Supervisor / Helper) — shown on employee list |
| LF-104 | "Export CSV" button on employee list — exports name, designation, department, email, salary |
| LF-105 | Employee table wrapped in `.table-wrapper` with `overflow-x: auto` — mobile horizontal scroll; sidebar collapses to icons on small screens |

---

## API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | Get all employees |
| GET | /api/employees/:id | Get single employee |
| POST | /api/employees | Create employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |

### Overtime
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/overtime | Get all overtime records |
| POST | /api/overtime | Create overtime entry |
| PATCH | /api/overtime/:id/status | Approve or reject entry |
| DELETE | /api/overtime/:id | Delete entry |

---

## Commit History

```
feat: add overtime entry & approval screen with full validation (Part 1)
fix(LF-101): change all date displays to DD/MM/YYYY format
fix(LF-102): add positive-number validation on salary fields
feat(LF-103): add designation dropdown to employee form and list
feat(LF-104): add CSV export button on employee list
fix(LF-105): make employee table responsive with horizontal scroll on mobile
```

---

## Ticket LF-105 Note

Chose horizontal scroll approach over stacked layout — construction site managers are used to tabular data and stacked layout would lose column context. The `overflow-x: auto` on `.table-wrapper` is the pragmatic fix. Sidebar also collapses to icon-only on screens < 768px to maximize content area.
