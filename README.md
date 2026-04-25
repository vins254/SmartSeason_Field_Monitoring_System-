# SmartSeason Field Monitoring System 🌾

A premium, full-stack agricultural management platform designed for seamless tracking of crop progress, field activities, and harvest cycles. Optimized for both desktop and mobile operations.

---

## ✨ Features

### 🏢 Administration & Oversight
- **Global Dashboard**: Real-time stats across all monitored fields including health status and stage distribution.
- **Smart Field Creation**: Standardized field setup with mandatory Field Agent assignment for accountability.
- **Asset Management**: Full CRUD capabilities for field data and agent organization.

### 🚜 Field Operations
- **Agent Dashboard**: Focused view on assigned fields with status indicators and update prompts.
- **Progress Tracking**: One-touch stage updates (Planted → Growing → Ready → Harvested).
- **Observation Logs**: Add detailed notes and history logs for each field transition.

### 📱 Premium Design & UX
- **Agriculture-Friendly Palette**: Professional design using Green (Success), Amber (Risk), and Slate (Information).
- **Fully Responsive**: Optimized for rugged field use via smartphone or tablet with adaptive mobile menus.
- **High-Performance Stats**: Visual badges and clear typography (Inter) for instant data readability.

---

## 🛠️ Tech Stack

- **Frontend**: React 18 (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL with Supabase
- **ORM**: Prisma (Type-safe access)
- **Security**: JWT-based Authentication with local persistence

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (Local or Supabase)

### 1. Database Setup
Create your database and update `server/.env`:
```bash
# Example DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/smartseason?schema=public"
```

### 2. Backend Initialization
```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed    # Populates demo admin and agent
npm run dev
```

### 3. Frontend Initialization
```bash
cd client
npm install
npm run dev
```

---

## ☁️ Deployment

The system is optimized for cloud deployment:
- **Frontend**: Deploy to **Vercel** (Point to your Backend URL via `VITE_API_BASE_URL`).
- **Backend**: Deploy to **Render** (Root: `server`, Build: `npm install && npm run build`).
- **Database**: Use **Supabase** for a managed PostgreSQL instance.

*Detailed deployment instructions are available in the project documentation.*

---

## 🔐 Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@smartseason.com` | `admin123` |
| **Agent** | `agent@smartseason.com` | `agent123` |

---

## 📐 Design Philosophy

1. **Aesthetics Over Minimalism**: We use a curated color palette to provide meaning (Green for Healthy, Yellow for At Risk, Gray for Completed).
2. **Data Integrity**: Enforced agent-to-field relationships ensure no field is left monitoring-less.
3. **Mobile First**: Navigation and management tools are designed to work perfectly on small touchscreens for agents in the field.

---

MIT License © 2026 SmartSeason Team