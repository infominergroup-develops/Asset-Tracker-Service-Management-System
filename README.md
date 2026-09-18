# Infominers Group: Asset Tracker & Service Management System

A comprehensive, role-based asset and service management web application designed for enterprise environments. This platform streamlines the entire lifecycle of IT and physical assets, from incident reporting and ticketing to vendor assignment, quotation approvals, and maintenance resolution.

## Core Features

- **Asset Master Inventory:** Complete registry of physical IT equipment, facilities, HVAC, vehicles, and office furniture with real-time status and condition tracking.
- **Service Desk & Ticketing Workflow:** Employees can submit tickets without a login. Tickets are routed to managers for approval.
- **Role-Based Access Control (RBAC):** Strict authentication dividing access among Directors, Admins, Managers, and Vendors.
- **Vendor Portal:** External vendors can log in to view assigned work orders, submit cost quotations, and update maintenance progress.
- **Quotation Approval Workflow:** Managers and Directors can review, approve, or reject vendor quotations directly through the portal.
- **Audit Logging:** Comprehensive, tamper-proof audit trails for all critical actions (ticket creation, approvals, asset modifications).

## User Roles & Permissions

- **Director & Admin (Full Access):** Can oversee the entire platform, manage all assets and employees, and approve high-level quotations and tickets.
- **Manager:** Has the ability to add/edit/delete employees, assets, and vendors. Manages the daily ticketing workflow and assigns work to vendors.
- **Vendor (Restricted Access):** Can only view tickets assigned to them. Can submit quotations and update work order statuses.
- **Employee (Guest / Public Access):** Uses the public-facing portal without a login to quickly report issues and track ticket status using their Ticket ID and email.

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Backend / Database:** Google Firebase (Firestore for real-time NoSQL database, Firebase Authentication for secure login)
- **Deployment:** Cloudflare Tunnels (Dev) / DigitalOcean App Platform (Prod)

## Running Locally

**Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository** (if you haven't already).
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Access the application:**
   Open your browser and navigate to `http://localhost:5173`.

## Database Configuration

The application is pre-configured to connect to a live Firebase instance. No local database setup or Docker containers are required. The frontend connects directly to Firebase Firestore using the credentials provided in `src/config/firebase.ts`.

When deploying to production (e.g., DigitalOcean App Platform), simply build the application (`npm run build`) and serve the static files from the `dist` directory. The browser will handle the database connections natively.
