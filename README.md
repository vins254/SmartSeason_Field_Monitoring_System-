# SmartSeason Field Monitoring System 🌾

### 🌐 Live Demo: [https://smart-season-field-monitoring-syste-ochre.vercel.app/](https://smart-season-field-monitoring-syste-ochre.vercel.app/)

#### 🔐 Demo Credentials:
- **Administrator**: `admin@smartseason.com` / `admin123`
- **Field Agent**: `agent@smartseason.com` / `agent123`

---

A professional, full-stack agricultural management platform built for farm coordinators and field agents. It provides real-time oversight of crop progress, agent accountability, and operational efficiency.

## 🖼️ System Preview

### Admin Dashboard
![Admin Dashboard](./screenshots/admin%20dashboard.png)
*Automated statistics and growth stage distribution analysis.*

### Field Management
![Field Management](./screenshots/admin%20fields.png)
*Detailed grid view of all monitored crops and their real-time health status.*

### User Management
![User Management](./screenshots/user%20dashboard.png)
*Comprehensive team directory for managing Admins and Field Agents.*

---

## 🚀 Getting Started (Fast-Track)

### 1. Database (Supabase)
- Create a project and get your **Direct Connection URI**.
- Ensure any special characters in the password are **Percent-Encoded**.

### 2. Backend (Server)
```bash
cd server
npm install
npx prisma generate
npx prisma db push   # Syncs your tables to Supabase
npm run db:seed      # Creates admin@smartseason.com
npm run dev          # Runs on http://localhost:3000
```

### 3. Frontend (Client)
```bash
cd client
npm install
npm run dev          # Runs on http://localhost:5173
```

---

## 🎨 Design Decisions

### The "Health" Algorithm
We made a conscious choice to calculate field status (Active vs. At Risk) dynamically on every request. We assume that if a field hasn't had a status update in **14 days**, it requires immediate attention. This prevents "data rot" where a field stays "Active" in the database long after it has been abandoned.

### Mobile-First Navigation
The system is built with **Tailwind CSS** and a custom responsive Layout. We assumed that Field Agents are using smartphones while standing in the dirt, so we prioritized big buttons, a clean mobile hamburger menu, and high-contrast badges.

### Color Meaning
We use a curated palette where colors have specific operational meanings:
- **Green**: Healthy/Active
- **Amber**: Needs Attention (At Risk)
- **Slate**: Neutrals (Completed/Neutral)
- **Red**: Danger/Error

---

## 🧠 Core Assumptions

1. **Connectivity**: We assume that agents have access to mobile data or Wi-Fi when making updates.
2. **Standard Growth Cycles**: The system is pre-configured for a 4-stage lifecycle (Planted, Growing, Ready, Harvested).
3. **Restricted Enrollment & Team Management**: To keep the system secure, we assumed that only **Administrators** should be able to create new user accounts. There is no "Public Sign-Up" page. We also implemented a full **User Management Dashboard** for Admins to edit profile details, change roles, or remove accounts.

---

## 📄 Documentation

For a deep dive into the architecture, tech stack rationale, and implementation details, please see our [**Advanced Documentation (DOCUMENTATION.md)**](./DOCUMENTATION.md).

---

## ☁️ Deployment Essentials

- **Backend (Render)**: Set `DATABASE_URL` and `JWT_SECRET`.
- **Frontend (Vercel)**: Set `VITE_API_BASE_URL` to your Render API URL.
- **Database (Supabase)**: Use the Transaction Pooler (port 6543) for the live app for best performance.

---