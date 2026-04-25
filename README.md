# SmartSeason Field Monitoring System 🌾

### 🌐 Live Deployment: [https://smart-season-field-monitoring-syste-ochre.vercel.app/](https://smart-season-field-monitoring-syste-ochre.vercel.app/)

#### 🔐 Demo Credentials:
| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@smartseason.com` | `admin123` |
| **Field Agent** | `agent@smartseason.com` | `agent123` |

---

## 📖 Overview
**SmartSeason** is a professional, full-stack agricultural management platform designed to bridge the gap between farm coordinators (Admins) and field professionals (Agents). The system provides a centralized dashboard for real-time crop lifecycle tracking, automated health monitoring, and comprehensive team management.

Built with a focus on **Operational Accountability**, SmartSeason ensures that every field under management is regularly audited and that "stale" data is flagged automatically for administrative review.

---

## 🏗️ Technical Architecture

### Frontend (Client)
- **Framework**: React 18 + Vite (TypeScript)
- **Styling**: Tailwind CSS + Shadcn UI Components
- **Icons**: Lucide React
- **State & Routing**: React Router 6 (BrowserRouter)
- **Special Handling**: Implemented **Vercel Rewrite Rules** (`vercel.json`) to handle Single Page Application (SPA) routing, ensuring that browser reloads on nested paths (e.g., `/fields/5`) do not result in 404 errors.

### Backend (Server)
- **Runtime**: Node.js + Express (TypeScript)
- **ORM**: Prisma (connected to PostgreSQL via Supabase)
- **Auth**: JSON Web Tokens (JWT) + Bcrypt hashing
- **Stability**: Catch-all routing handles SPA fallbacks for direct-link accessibility.

---

## 🚀 Deployment & Local Setup

### 1. Database Configuration
1. Provision a PostgreSQL instance (Supabase recommended).
2. Grab your **Direct Connection URI**.
3. *Crucial*: Ensure any special characters in the password are **Percent-Encoded**.

### 2. Backend Initialization
```bash
cd server
npm install
npx prisma generate
npx prisma db push   # Syncs schema to the cloud
npm run db:seed      # Initializes the default admin account
npm run dev          # Active on http://localhost:3000
```

### 3. Frontend Initialization
```bash
cd client
npm install
npm run dev          # Active on http://localhost:5173
```

---

## 🎨 Design Philosophy & Operational Logic

### 🛡️ Secure User Management
To maintain system integrity, SmartSeason does not permit public registrations. Administrators have an exclusive **User Management Suite** where they can:
- Onboard new agents or fellow admins.
- Modify existing profiles or update security credentials.
- Revoke system access by deleting accounts (with self-deletion protection).

### ⚡ Dynamic Health Scoring
Instead of storing a static status in the database, the system computes the **Field Health** on-the-fly:
- **Active**: Updated within the last 14 days.
- **At Risk**: No activity for >14 days (Alerts the coordinator).
- **Completed**: The "Harvested" phase has been reached.

### 📱 Field-Ready UI
The interface is designed for high-glare environments. Using **Tailwind CSS**, we've implemented a mobile-first layout with high-contrast status badges and large, accessible touch targets for agents operating in the field.

---

## 📄 Documentation

For a deep dive into the code structure, database schema, and detailed API documentation, please refer to the [**Operational Guide (DOCUMENTATION.md)**](./DOCUMENTATION.md).

---

## ☁️ Cloud Deployment Essentials

- **Backend (Render/Heroku)**: Set `DATABASE_URL` and `JWT_SECRET`.
- **Frontend (Vercel)**: Set `VITE_API_BASE_URL` and ensure `vercel.json` is present.
- **Database (Supabase)**: Enable the Transaction Pooler for high-traffic production environments.

---