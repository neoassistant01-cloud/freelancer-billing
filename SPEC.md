# FreelancerFlow - Specification Document

## Project Overview
- **Name**: FreelancerFlow
- **Type**: Web Application (SaaS)
- **Core Functionality**: Invoicing, time tracking, and client management for freelancers
- **Target Users**: Freelancers, independent contractors, small business owners

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- File-based JSON database (data.json)

## Features

### 1. Authentication
- User registration with email/password
- Login with email/password
- Session-based authentication

### 2. Dashboard
- Overview of revenue (total, outstanding)
- Tracked hours summary
- Recent invoices list

### 3. Client Management
- Add new clients (name, email, company, address, phone, notes)
- Edit existing clients
- Delete clients
- View client list and details

### 4. Time Tracking
- Start/stop timer for active tracking
- Manual time entry logging
- Associate time with clients
- View time entries history

### 5. Invoicing
- Create invoices with line items
- Auto-calculate subtotal, tax, total
- Invoice status: draft, sent, paid
- PDF export functionality

## Data Model

### User
- id (UUID)
- email (string)
- passwordHash (string)
- createdAt (timestamp)

### Client
- id (UUID)
- userId (UUID)
- name (string)
- email (string)
- company (string)
- address (string)
- phone (string)
- notes (string)
- createdAt, updatedAt (timestamps)

### Invoice
- id (UUID)
- userId (UUID)
- clientId (UUID)
- invoiceNumber (string)
- status (draft|sent|paid)
- lineItems (array)
- subtotal, taxAmount, total (numbers)
- createdAt, updatedAt (timestamps)

### TimeEntry
- id (UUID)
- userId, clientId (UUIDs)
- description (string)
- startTime, endTime (timestamps)
- duration (seconds)
- createdAt (timestamp)

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

## Pages
- /login - Login page
- /register - Registration page
- /dashboard - Main dashboard
- /clients - Client list
- /clients/new - Add new client
- /clients/[id] - Client details/edit
- /invoices - Invoice list
- /invoices/new - Create invoice
- /invoices/[id] - Invoice details
- /time - Time tracking

## Status
✅ MVP Complete - All core features implemented and verified working
