# SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT-based authentication

## Project Structure

```
field-monitoring-system/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.tsx
│   └── package.json
├── server/          # Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.ts
│   ├── prisma/
│   └── package.json
└── README.md
```

## Features

### Users & Access
- Two roles: Admin (Coordinator) and Field Agent
- JWT-based authentication
- Role-based access control

### Field Management
- Create, edit, and delete fields
- Assign fields to field agents
- Track: name, crop type, planting date, current stage

### Field Updates
- Field Agents can update field stage
- Add notes/observations
- View update history

### Field Stages
- Planted → Growing → Ready → Harvested

### Field Status Logic
- **Active**: Field updated within 14 days and not harvested
- **At Risk**: No updates for more than 14 days
- **Completed**: Stage is Harvested

### Dashboard
- **Admin**: Overview of all fields with stats
- **Field Agent**: Overview of assigned fields
- Summary: total fields, status breakdown, stage distribution

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE smartseason;
```

2. Update the DATABASE_URL in `server/.env` with your credentials:
```
DATABASE_URL="postgresql://username:password@localhost:5432/smartseason?schema=public"
```

### Backend Setup

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

The server will run on http://localhost:3000

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client will run on http://localhost:5173

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartseason.com | admin123 |
| Agent | agent@smartseason.com | agent123 |

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Fields
- `GET /api/fields` - List all fields
- `GET /api/fields/:id` - Get field details
- `POST /api/fields` - Create field (admin)
- `PUT /api/fields/:id` - Update field (admin)
- `DELETE /api/fields/:id` - Delete field (admin)
- `GET /api/fields/:id/updates` - Get field updates
- `POST /api/fields/:id/updates` - Create field update

### Users
- `GET /api/users` - List users (admin)
- `GET /api/users/agents` - List agents (admin)

## Design Decisions

1. **Status Computation**: Status is computed on the server based on field stage and time since last update. This ensures consistent status across all clients.

2. **Role-Based Access**: Admin has full access to all fields and can manage them. Field Agents can only view and update their assigned fields.

3. **Simple UI**: Focused on essential functionality with clean, intuitive interface. No unnecessary complexity.

4. **RESTful API**: Clean REST API design with proper HTTP methods and status codes.

5. **Prisma ORM**: Used Prisma for type-safe database operations and easy migrations.

## License

MIT