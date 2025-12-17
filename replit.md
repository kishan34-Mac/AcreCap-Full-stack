# AcreCap - Loan & Insurance Platform

## Overview
AcreCap is a business loans and insurance application originally built with Lovable and migrated to Replit's full-stack environment. It provides loan applications, insurance services, user authentication, submission management, and admin capabilities.

## Current State
- **Status**: Migration complete, running on Replit
- **Frontend**: React + Vite on port 5000 with Tailwind CSS, shadcn/ui
- **Backend**: Express.js server with API routes
- **Database**: Neon PostgreSQL via Drizzle ORM
- **Auth**: Supabase authentication (frontend) - requires credentials to enable

## Project Structure
```
├── client/src/          # Frontend React app
│   ├── components/      # UI components
│   ├── pages/           # Route pages
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
├── server/              # Backend Express server
│   ├── index.ts         # Entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   ├── db.ts            # Database connection
│   └── vite.ts          # Vite dev server setup
├── shared/              # Shared types/schemas
│   └── schema.ts        # Drizzle schema definitions
└── src/                 # Original Lovable source (frontend)
```

## Database Schema
- **profiles**: User profiles linked to Supabase auth
- **submissions**: Loan/insurance applications
- **activity_logs**: User activity tracking
- **backups**: Submission backups

## API Endpoints
- `GET /api/health` - Health check
- `GET /api/profiles` - List all profiles
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles` - Create profile
- `GET /api/submissions` - List all submissions
- `POST /api/submissions` - Create submission
- `GET /api/activity-logs` - List activity logs
- `POST /api/activity-logs` - Create activity log

## Environment Variables Required
- `DATABASE_URL` - Neon PostgreSQL connection string (auto-configured)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon/public key
- `VITE_ADMIN_EMAILS` - Comma-separated admin email addresses
- `VITE_BACKEND_URL` - Backend API URL (optional, defaults to same origin)

## Recent Changes (Dec 2024)
1. Migrated from Lovable to Replit full-stack template
2. Transitioned from Supabase database to Neon PostgreSQL with Drizzle ORM
3. Created Express API layer for database operations
4. Made Supabase auth optional - app runs without credentials
5. Fixed CSP policy for Vite HMR WebSocket connections
6. Updated ProtectedRoute and Navbar to handle missing Supabase gracefully

## Running the Project
The workflow "Start application" runs `npm run dev` which starts:
- Express backend server
- Vite development server for frontend
- Both served on port 5000

## User Preferences
- Keep authentication with Supabase on frontend
- Use Neon PostgreSQL for data storage
- Maintain existing UI/UX from Lovable version
