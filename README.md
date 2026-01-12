# Daksh Bank

A lightweight savings tracker for Daksh and Dhimant. Track money sent to each other in real life and keep a log of all transactions.

## Features

- 🔐 PIN authentication for both users
- 💰 Add/deduct money to shared savings
- 📋 Transaction logs show who made each entry
- 📊 Filter transactions by type and date
- 📥 Export logs to CSV
- 💵 Track total savings balance

## Tech Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (using better-sqlite3)
- **Frontend:** React + Vite + Tailwind CSS

## Users

| User ID  | PIN  | Name    |
|----------|------|---------|
| daksh    | 1234 | Daksh   |
| dhimant  | 5678 | Dhimant |

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install all dependencies:
```bash
npm run setup
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend on http://localhost:3000

### Running Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## API Endpoints

### Authentication
- `POST /api/auth/verify-pin` - Verify user credentials
  - Body: `{ "userId": "string", "pin": "string" }`

### Balance
- `GET /api/balance?userId=xxx` - Get user balance

### Transactions
- `POST /api/transactions` - Create a new transaction
  - Body: `{ "userId": "savings", "type": "add|deduct", "amount": number, "description": "string", "addedBy": "daksh|dhimant" }`

- `GET /api/transactions` - Get transactions with optional filters
  - Query params: `type`, `startDate`, `endDate`, `limit`, `offset`, `format=csv`

## Deployment

For Vercel deployment, you'll need a cloud database. Options:
- **Turso** (SQLite-compatible, has free tier)
- **PlanetScale** (MySQL)
- **Supabase** (PostgreSQL)

Or deploy backend separately on **Railway** or **Render** (both have free tiers).

## Project Structure

```
daksh-bank/
├── server/
│   ├── index.js          # Express server entry point
│   ├── database.js       # SQLite database setup
│   └── routes/
│       ├── auth.js       # Authentication routes
│       ├── balance.js    # Balance routes
│       └── transactions.js # Transaction routes
├── client/
│   ├── src/
│   │   ├── App.jsx       # Main app component
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   └── TransactionList.jsx
│   │   └── index.css     # Tailwind styles
│   ├── tailwind.config.js
│   └── vite.config.js
├── package.json
└── README.md
```

## License

MIT
