# FreelancerFlow - Freelancer Billing SaaS

A production-ready invoicing, time tracking, and client management application for freelancers.

## Status: ✅ MVP Complete

All core features implemented and verified working.

## Features

- **Dashboard** - Overview of revenue, outstanding invoices, and tracked hours
- **Client Management** - Add, edit, delete clients
- **Time Tracking** - Start/stop timer or log manual time entries
- **Invoicing** - Create invoices with line items, auto-calculations, status tracking (draft/sent/paid)
- **PDF Export** - Download invoices as PDF

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- File-based JSON database (simple persistence)

## Getting Started

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Start production server
pnpm start
```

The app runs on `http://localhost:3000`.

## Project Structure

```
app/
├── login/           # Login page
├── register/        # Registration page
├── dashboard/       # Dashboard page
├── clients/         # Client management (list, new, [id])
├── invoices/        # Invoice management (list, new, [id])
├── time/            # Time tracking
└── api/             # API routes (REST endpoints)

components/
└── Sidebar.tsx     # Reusable navigation sidebar

lib/
└── db.ts           # Database operations (JSON file storage)
```

## Database

Data is stored in `data.json` in the project root. To reset:
```bash
rm data.json
```

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET/POST /api/clients
- GET/PUT/DELETE /api/clients/:id
- GET/POST /api/invoices
- GET /api/invoices/:id
- PUT /api/invoices/:id/status
- GET /api/invoices/:id/pdf
- GET/POST /api/time-entries
- POST /api/time-entries/:id/stop
- GET /api/dashboard
