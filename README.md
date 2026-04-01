# AcreCap Full Stack

AcreCap is a full-stack loan and insurance platform built with React, Vite, Express, and MongoDB Atlas.

It includes:

- user signup and login
- loan application submission
- admin login and admin panel
- application review workflow
- accept, reject, and reset status actions
- CSV and Excel-friendly export from the admin panel
- responsive layouts for mobile, tablet, laptop, and desktop

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Express, TypeScript
- Database: MongoDB Atlas with Mongoose
- Auth: Session auth with production cookie handling and bearer-token fallback
- Deployment:
  - Frontend on Vercel
  - Backend on Render

## Features

- Public marketing website for loans and insurance
- Detailed loan pages and insurance pages
- Responsive homepage and internal pages
- User authentication
- Loan application form with multi-step flow
- User dashboard to view submitted applications
- Admin panel to:
  - view all applications
  - open application details
  - accept applications
  - reject applications
  - reset application status
  - export data in CSV
  - export data in Excel-friendly format

## Project Structure

```text
src/        Frontend React app
server/     Express backend, auth, Mongo connection, routes, storage
public/     Static assets
dist/       Frontend build output
```

## Environment Variables

Create a local `.env` file in the project root.

Example:

```env
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net"
MONGODB_DB="acrecap"
SESSION_SECRET="replace-with-a-strong-random-secret"
JWT_SECRET="replace-with-a-second-strong-random-secret"
FRONTEND_URL="https://your-vercel-app.vercel.app"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="no-reply@example.com"
SMTP_PASS="replace-with-smtp-password"
SMTP_FROM="AcreCap <no-reply@example.com>"
PASSWORD_RESET_EMAIL_WEBHOOK_URL="https://your-email-webhook.example.com"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
ADMIN_NAME="Admin"
```

### Required Variables

- `MONGODB_URI`: MongoDB Atlas connection string
- `SESSION_SECRET`: Secret used for Express session cookies
- `JWT_SECRET`: Secret used for bearer token signing
- `ADMIN_EMAIL`: Seeded admin login email
- `ADMIN_PASSWORD`: Seeded admin login password
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`: Required if you want the app to send reset emails directly over SMTP

### Optional Variables

- `MONGODB_DB`: Database name, defaults to your configured Mongo database
- `FRONTEND_URL`: Frontend origin for production CORS
- `SMTP_SECURE`: Set `true` for SSL SMTP servers, usually with port `465`
- `SMTP_FROM`: Friendly sender name and email
- `PASSWORD_RESET_EMAIL_WEBHOOK_URL`: Fallback email webhook if SMTP is not configured
- `ADMIN_NAME`: Admin display name

## Local Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

The app uses the Express server as the main runtime during development.

## Build

Create the frontend production build:

```bash
npm run build
```

Run server type checking:

```bash
npm run typecheck:server
```

Start the production server locally:

```bash
npm run start
```

## Deployment

### Backend on Render

Use these settings:

- Language: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`

Set these environment variables on Render:

- `MONGODB_URI`
- `MONGODB_DB=acrecap`
- `SESSION_SECRET`
- `JWT_SECRET`
- `FRONTEND_URL=https://your-vercel-app.vercel.app`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `PASSWORD_RESET_EMAIL_WEBHOOK_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME=Admin`

### Frontend on Vercel

Use these settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Set this environment variable on Vercel:

- `VITE_BACKEND_URL=https://your-render-service.onrender.com`

## Production Notes

- In MongoDB Atlas, allow network access for your deployment environment
- Make sure the MongoDB user exists and has the correct password
- If your database password contains special characters, URL-encode it in the connection string
- Use strong secrets in production for both `SESSION_SECRET` and `JWT_SECRET`
- Replace the default admin password before going live
- Configure SMTP or `PASSWORD_RESET_EMAIL_WEBHOOK_URL` so forgot-password emails can actually be delivered

## Admin Workflow

1. User signs up and logs in
2. User fills and submits the loan application form
3. Application is saved in MongoDB
4. Admin logs in with the configured admin email and password
5. Admin opens the admin panel
6. Admin reviews submitted forms
7. Admin accepts, rejects, or resets applications
8. Admin exports application data if needed

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build frontend
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run typecheck:server`: Type-check backend

## Security Notes

This project includes several production-oriented protections, including:

- rate limiting on API routes
- secure production cookie handling
- CORS configuration for frontend/backend separation
- Helmet-based hardening
- password hashing
- admin-only protected routes

No web application is completely "hacker proof", so you should still:

- rotate secrets regularly
- use strong passwords
- monitor logs
- keep dependencies updated
- restrict admin access carefully

## Repository

GitHub:

[AcreCap-Full-stack](https://github.com/kishan34-Mac/AcreCap-Full-stack)
