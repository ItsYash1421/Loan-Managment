# Loan Management System

A comprehensive, role-based Loan Management System built with a modern tech stack. This platform allows administrators to manage operational staff and provides distinct portals for staff operations and borrower loan tracking.

## Tech Stack

### Frontend
- Framework: Next.js (React)
- Styling: Tailwind CSS
- Animation: Framer Motion
- Icons: Lucide React
- Routing: Next.js App Router

### Backend
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB (Mongoose)
- Authentication: JSON Web Tokens (JWT) and bcrypt
- Language: TypeScript

## Features

### Role-Based Access Control
The system supports strict role-based access to ensure security and compliance across the platform.

1. Admin: Has full control over user administration. Can create new staff accounts, assign roles, and block/unblock user access instantly.
2. Operational Staff: Includes Sales, Sanction, Disbursement, and Collection. Each role has restricted access to specific operational modules within the centralized Operations Hub.
3. Borrower: Has a dedicated portal to apply for loans, view loan statuses, track EMI schedules, and view payment ledgers.

### Administrative Controls
- Create new operational users and assign specific module permissions.
- Instantly block or unblock staff members. Active sessions are immediately invalidated when a user is blocked.
- View a directory of all active and blocked operational staff.

### Borrower Portal
- Apply for new loans with real-time status updates (Pending, Approved, Rejected).
- View a comprehensive breakdown of active loans including paid amounts, outstanding balances, and total tenure.
- Access a detailed payment ledger displaying transaction history (UTR, Amount, Date).

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   cd backend

2. Install dependencies:
   npm install

3. Configure environment variables:
   Create a .env file in the backend directory (use .env.example as a template).
   Required variables:
   - PORT (default: 5000)
   - MONGODB_URI
   - JWT_SECRET

4. Start the development server:
   npm run dev

### Frontend Setup

1. Navigate to the frontend directory:
   cd frontend

2. Install dependencies:
   npm install

3. Configure environment variables:
   Ensure the frontend points to the correct backend API URL. This is managed in lib/api.ts.

4. Start the development server:
   npm run dev

## Architecture Notes

- Authentication is managed via JWT. The token is stored securely on the client and appended to all protected API requests.
- The UI leverages a responsive, dark-mode-first aesthetic with custom scrollbars and fluid animations.
- The backend uses standard MVC architecture with dedicated routes, controllers, and Mongoose models.

## Security

- Passwords are salted and hashed using bcrypt before storage.
- All protected routes require a valid JWT.
- Administrative endpoints include additional role verification middleware.
- Blocked users are evaluated at the database level on every request to ensure immediate session invalidation.
