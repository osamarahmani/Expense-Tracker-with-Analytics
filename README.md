# FinTrack — Finance Management System

Full-stack expense tracker with Admin/User roles, JWT auth, Charts, Reports, and CSV export.

---

## Tech Stack
- **Frontend**: React + Chart.js + Tailwind-inspired CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT + bcrypt

---

## ─── STEP-BY-STEP TO RUN ────────────────────────

### STEP 1 — Prerequisites
Make sure you have installed:
- Node.js (v18+)  → https://nodejs.org
- PostgreSQL       → https://www.postgresql.org
- pgAdmin          → comes with PostgreSQL installer

---

### STEP 2 — Create Database in pgAdmin
1. Open pgAdmin
2. Right-click Databases → Create → Database
3. Name it: `expense_tracker`
4. Click Save

---

### STEP 3 — Configure .env
Open `expense-tracker/.env` and replace YOUR_PASSWORD:

```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker"
JWT_SECRET="fintrack_super_secret_key_2024"
```

Example (if your PostgreSQL password is 1234):
```
DATABASE_URL="postgresql://postgres:1234@localhost:5432/expense_tracker"
JWT_SECRET="fintrack_super_secret_key_2024"
```

---

### STEP 4 — Backend Setup
Open terminal in the `expense-tracker/` folder:

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
node index.js
```

You should see:
```
🚀 Server running on http://localhost:5000
```

---

### STEP 5 — Frontend Setup
Open a NEW terminal in `expense-tracker/frontend/`:

```bash
npm install
npm start
```

Browser opens at: http://localhost:3000

---

### STEP 6 — Login
The seed created a default admin:
- **Email**: admin@gmail.com
- **Password**: admin123

---

## ─── HOSTING GUIDE ──────────────────────────────

### Database → Supabase (free)
1. Go to https://supabase.com → New Project
2. Copy the **connection string** from Settings → Database
3. Use it as your DATABASE_URL in Railway (below)

### Backend → Railway (free)
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Push your `expense-tracker/` folder (without `frontend/`) to GitHub
3. Add environment variables in Railway:
   - `DATABASE_URL` = your Supabase connection string
   - `JWT_SECRET`   = fintrack_super_secret_key_2024
4. Railway gives you a URL like: `https://fintrack-backend.up.railway.app`

### Frontend → Vercel (free)
1. In `frontend/src/api.js` change:
   ```js
   baseURL: "https://fintrack-backend.up.railway.app/api"
   ```
2. Go to https://vercel.com → New Project → Import your `frontend/` folder
3. Click Deploy
4. Your app is live!

---

## Project Structure

```
expense-tracker/
├── index.js              ← Main server
├── .env                  ← DB + JWT config
├── package.json
├── prisma/
│   ├── schema.prisma     ← DB models
│   └── seed.js           ← Default data
├── utils/
│   └── prisma.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── routes/
│   ├── auth.js
│   ├── admin.js
│   ├── transaction.js
│   ├── report.js
│   └── category.js
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── App.css
        ├── api.js
        ├── Login.js
        ├── UserDashboard.js
        └── AdminDashboard.js
```
