# FinTrack — Finance Management System

Expense Tracker with Analytics
Problem: Personal finance tracking.
Core Features:
• Add income/expense
• Categories
• Monthly reports
• Charts (frontend)
• Export CSV
DB Design:
• users
• transactions
• categories
Focus: aggregation queries (SUM, GROUP BY), filtering

Full-stack expense tracker with Admin/User roles, JWT auth, Charts, Reports, and CSV export.

---

## Tech Stack

- **Frontend**: React + Chart.js + Tailwind-inspired CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT + bcrypt

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
