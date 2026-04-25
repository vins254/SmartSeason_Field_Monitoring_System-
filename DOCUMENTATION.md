# Advanced Project Documentation: SmartSeason Field Monitoring System

## Project Overview
The SmartSeason Field Monitoring System is a professional agricultural ERP tool designed to bridge the gap between farm coordinators (Admins) and those working in the fields (Field Agents). It replaces messy spreadsheets and verbal updates with a real-time, data-driven platform for tracking crop health and growth cycles.

---

## Technical Stack & Rationale

### ⚛️ Frontend: React 18 & Vite
- **Rationale**: We chose Vite over Create-React-App for its lightning-fast HMR (Hot Module Replacement) and optimized build process. React's component-based architecture allows us to reuse UI elements like "Status Badges" and "Field Cards" across the entire app.
- **Styling**: Tailwind CSS is used for all styling. It allowed us to implement a "Mobile-First" design without writing hundreds of lines of media queries.

### 🚀 Backend: Node.js & Express
- **Rationale**: A lightweight Express server is perfect for a RESTful API. It's easy to scale and has excellent support for JWT authentication.
- **Environment**: We use `dotenv` to keep sensitive keys (like database passwords) out of the codebase.

### 💾 Database: PostgreSQL & Prisma
- **Rationale**: PostgreSQL is the gold standard for relational data. Prisma was chosen because it provides a **Type-safe Client**. This means if we change a field in the database, our code will immediately show an error if we're trying to access the old field name, preventing dozens of runtime bugs.

---

## Architecture & Why We Built It This Way

### 1. The "14-Day Health" Logic (Automated Status)
We implemented a dynamic status calculation rather than a static database field.
- **The Feature**: Every time a field is loaded, the server calculates: `Current Time - Last Update Time`. If this exceeds 14 days, the status automatically flips to "At Risk".
- **Why?**: Storing "Active" in the database would be a lie the moment the agent stops updating. By calculating it in real-time, the Admin *always* sees the absolute truth about field monitoring activity.

### 2. Mandatory Agent Assignment
- **The Feature**: A field cannot be created without an assigned agent.
- **Why?**: In agricultural logistics, a "lost field" (one with no one assigned) is a massive financial risk. We enforced this at both the UI level and the API level to ensure accountability.

### 3. Role-Based Navigation (RBAC)
- **The Feature**: The "Users" and "Field Management" tools are hidden or blocked for Field Agents.
- **Why?**: Agents should focus on their specific crops. By reducing "UI clutter" for agents, they can perform their updates faster while protecting sensitive administrative data.

---

## File Structure Deep-Dive

### Backend (`/server`)
- `src/index.ts`: The entry point. It sets up the server, connects to the database, and registers health checks.
- `src/routes/fields.ts`: This is where the heavy lifting happens. It manages the field lifecycle and status calculations.
- `src/middleware/auth.ts`: Our security layer. It verifies the JWT token before letting any request reach the data.

### Frontend (`/client`)
- `src/App.tsx`: The "Brain". It manages the global authentication state and the routing state.
- `src/components/Layout.tsx`: The "Frame". It provides the consistent sidebar, header, and mobile navigation responsive wrapper.

---

## Deployment Strategy

### 🌐 Frontend (Vercel)
Vercel was chosen for its excellent Vite support. It serves the static assets and handles the routing. We use the `VITE_API_BASE_URL` env variable to tell the frontend where the backend lives.

### ☁️ Backend (Render)
Render hosts the live Node.js process. We chose it because it's simpler than AWS but more powerful than basic shared hosting. It automatically rebuilds whenever you push code.

### 🐘 Database (Supabase)
Supabase provides a world-class PostgreSQL instance that's always on. By using their **Connection Pooling**, we can handle hundreds of concurrent server requests without exhausting the database's connection limit.

---

## Assumptions & Design Choices
1. **Always Online**: The system assumes the user has an internet connection (common for modern agricultural sites with 4G/LTE coverage).
2. **Standard Growth Phases**: We assumed a standard 4-phase growth cycle (Planted → Growing → Ready → Harvested). Extensions could be added for specialized crops like vineyards.
3. **Admin Authority**: We assumed a top-down management style where Admins are the only ones authorized to add new team members for security reasons.
