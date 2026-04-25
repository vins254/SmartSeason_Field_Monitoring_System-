# 📚 Operational & Technical Documentation: SmartSeason

## 🎯 Project Mission
SmartSeason is an enterprise-grade agricultural ERP designed to eliminate information silos in farm management. It provides a robust framework for tracking crop development through standardized growth phases while ensuring complete accountability for field personnel.

---

## 🛠️ Technology Stack Deep-Dive

### ⚛️ Reactive Frontend (React + Vite)
- **TypeScript**: Used throughout the project to ensure data integrity. Interface definitions for `Field`, `User`, and `AuthContext` prevent common runtime type errors.
- **Vite**: Chosen for its "Instant Server Start" and optimized Rollup-based build process.
- **Client-Side Routing**: Handled by `react-router-dom`. 
    - **Technical Fix**: To prevent the common "404 on refresh" issue in Single Page Applications, we've implemented both a server-side wildcard catch-all and a `vercel.json` rewrite configuration. This ensures that direct links and browser refreshes always resolve correctly back to the React application.

### ⚙️ Scalable Backend (Node.js + Express)
- **Middleware-First Architecture**: We use a custom `authenticateToken` middleware to secure every sensitive API route. It decodes JWTs and injects the `user` object into the Request, enabling Role-Based Access Control (RBAC).
- **Security**: 
    - Passwords: Salted and hashed using `bcryptjs` (Cost factor: 10).
    - Session: 24-hour stateless JWT tokens.

### 🐘 Data Persistence (PostgreSQL + Prisma)
- **Schema Safety**: Prisma acts as our "Source of Truth." The `schema.prisma` file defines our relations, ensuring that if a User is deleted, we can't have "orphan" field updates without a valid owner (or handling the cascade).
- **Connection Pooling**: Integrated with Supabase Transaction Bouncer to maintain high availability even during traffic spikes.

---

## 🧠 Architectural Logic

### 1. Dynamic Health Algorithm (Calculated State)
Instead of storing a static status (e.g., "Active") in the database, the server computes it dynamically during the `GET` request:
- **Logic**: `IF (Today - LastUpdate) > 14 days THEN status = AT_RISK`.
- **Rational**: This prevents "false positives" in the dashboard. If an agent stops monitoring a field, the system automatically alerts the Admin through the UI without manual intervention.

### 2. Role-Based Access Control (RBAC)
- **Admin**: Full CRUD access to the entire system, including user onboarding and field archiving.
- **Agent**: Strictly restricted to viewing and reporting on fields specifically assigned to them.
- **Implementation**: Managed via a `role` column in the User table and verified by backend route logic.

### 3. SPA Persistence Strategy
The application is designed to be "Refresh-Resilient." 
- **Server-Side**: `app.get('*', ...)` ensures the Express server sends `index.html` for any unknown route.
- **Cloud-Side**: `vercel.json` provides the same logic for production deployments on Vercel's edge network.

---

## 📂 Codebase Navigation

### `/server/src`
- **[`index.ts`](file:///f:/Projects/field-monitoring-system/server/src/index.ts)**: Application entry point & SPA fallback handler.
- **[`routes/fields.ts`](file:///f:/Projects/field-monitoring-system/server/src/routes/fields.ts)**: Core business logic for agricultural monitoring.
- **[`routes/users.ts`](file:///f:/Projects/field-monitoring-system/server/src/routes/users.ts)**: Team directory and permission management.
- **[`middleware/auth.ts`](file:///f:/Projects/field-monitoring-system/server/src/middleware/auth.ts)**: Security interceptors.

### `/client/src`
- **[`App.tsx`](file:///f:/Projects/field-monitoring-system/client/src/App.tsx)**: Global Auth Provider and route guard definitions.
- **[`pages/Dashboard.tsx`](file:///f:/Projects/field-monitoring-system/client/src/pages/Dashboard.tsx)**: Statistical analysis and data visualization.
- **[`lib/utils.ts`](file:///f:/Projects/field-monitoring-system/client/src/lib/utils.ts)**: Shared formatting and logic utilities.

---

## 🎨 Visual Interface Guide

### 1. Administrative Oversight
The **Admin Dashboard** provides high-level KPIs and growth stage distribution charts.
![Admin Dashboard](./screenshots/admin%20dashboard.png)

### 2. Team Management
The **User Directory** allows coordinators to manage access controls and monitor team growth.
![User Management](./screenshots/user%20dashboard.png)

### 3. Professional Field Updates
The **Field Detail** view allows agents to submit chronological growth reports with observational notes.
![Field Update](./screenshots/agent%20field.png)

---

## ☁️ Deployment Configuration

| Environment Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Prisma/Supabase Connection String | `postgresql://...` |
| `JWT_SECRET` | Secret key for token signing | `your-long-secret-key` |
| `VITE_API_BASE_URL` | URL of the running Node.js API | `https://api.yourdomain.com` |

---

## 🛠️ Maintenance & Development
Every file in this project has been extensively documented with **Human-Friendly Comments**. These comments explain the "Why" behind the logic, making it easy for new developers to maintain or extend the system without external documentation.
