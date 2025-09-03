Expenzo-Smart Expense Tracker with AI Insights 
## Project Overview
Expense Tracker is a full‑stack personal finance app to help you understand and improve your spending habits.

- **Track Expenses**: Add, edit, delete, and review all your expenses with categories, amounts, and dates. The dashboard summarizes today, this week, this month, and all‑time spending, along with top categories.
- **Create & Track Savings Goals**: Define savings goals with target amounts, categories, priorities, and target dates. Monitor total saved vs. goal, see active/completed goals, and view category‑level progress.
- **AI‑Based Insights (Reports)**: Generate an AI‑powered narrative report that analyzes your expenses and savings to surface patterns, category breakdowns, trends, and recommendations.
- **Secure Access**: Register and log in; protected API routes require a JWT bearer token.
- **Fast, Modern Stack**: React + Vite frontend, Express + Mongoose backend, and MongoDB for persistent storage.

##Setup & Documentation

This guide explains how to set up the project locally, initialize MongoDB, connect the backend and frontend, and understand the database documents.

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Community Server running locally on `mongodb://localhost:27017`

## Project Structure
- `expense-tracker-backend/`: Express + Mongoose API
- `expense-tracker-client/`: React + Vite frontend

## 1) Clone and Install
```bash
git clone <your-repo-url>.git
cd "Expense Tracker"

# Backend
cd expense-tracker-backend
npm install

# Frontend
cd ../expense-tracker-client
npm install
```

## 2) Configure Environment Variables (Backend)
Create an `.env` file inside `expense-tracker-backend/`:
```env
JWT_SECRET=supersecretkey123
PORT=5001
```

Note: The backend currently connects to MongoDB at `mongodb://localhost:27017/Expense-Tracker` (configured in `expense-tracker-backend/index.js`). If you need to change this, update the connection string in that file.

## 3) Start MongoDB
Ensure MongoDB is running locally. Typical commands:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run mongod manually
mongod --dbpath /usr/local/var/mongodb
```

Verify the DB is up by connecting with the MongoDB shell or Compass to `mongodb://localhost:27017`.

## 4) Initialize the Database
The app will auto-create the database `Expense-Tracker` and collections on first write.

Optional: You can pre-create the DB and inspect it:
```bash
mongosh
use Expense-Tracker
show collections
```

## 5) Run the Backend
```bash
cd "Expense Tracker"/expense-tracker-backend
npm start
```
Expected output includes:
```
MongoDB connected
Backend running on port 5001
```

API routes (selected):
- POST `/register`
- POST `/login`
- GET `/api/expenses/summary`
- GET `/api/expenses/recent`
- GET `/api/allexpenses`
- POST `/api/expenses`
- GET `/api/savings`
- GET `/api/savings/summary`
- POST `/api/savings`
- PUT `/api/savings/:id`
- PATCH `/api/savings/:id/amount`
- DELETE `/api/savings/:id`

## 6) Run the Frontend
```bash
cd "Expense Tracker"/expense-tracker-client
npm run dev
```
Open the printed local URL (usually `http://localhost:5173`). Ensure the frontend points to the backend base URL `http://localhost:5001` wherever API calls are made.

## 7) Authentication
- Register via POST `/register` with `{ name, email, password }`.
- Login via POST `/login` to receive a JWT.
- For protected routes, pass the token in the `Authorization` header as `Bearer <token>`.

## 8) Database Schema (Mongoose Models)

### Users (collection: `Users`)
Fields:
- `name` String, required
- `email` String, required, unique
- `password` String, required (bcrypt-hashed)

### Expenses (collection: inferred as `expenses`)
Fields:
- `userId` ObjectId ref `User`, required
- `description` String, required
- `amount` Number, required
- `category` String, required
- `date` Date, required
- `createdAt` Date (default now)
- `updatedAt` Date (default now)

### Savings (collection: `Savings`)
Fields:
- `userId` ObjectId ref `User`, required
- `title` String, required
- `amount` Number, required, default 0
- `category` String, required, one of:
  - `Emergency Fund`, `Vacation`, `House`, `Car`, `Education`, `Wedding`, `Retirement`, `Other`
- `goalAmount` Number, required
- `targetDate` Date, required
- `priority` String, required, one of: `High`, `Medium`, `Low` (default `Medium`)
- `status` String, required, one of: `Active`, `Completed`, `Paused` (default `Active`)
- `alerts` Object
  - `reminderFrequency` String, `Weekly` | `Monthly` (default `Monthly`)
  - `milestoneAlerts` Boolean (default `true`)
  - `targetDateReminder` Boolean (default `true`)
- `notes` String (optional, default "")
- `createdAt` Date (default now)
- `updatedAt` Date (auto-updated on save/update)

## 9) Common Issues
- If the frontend cannot reach the backend, confirm the backend port (`5001`) and CORS settings.
- If MongoDB fails to connect, ensure the service is running and the URI `mongodb://localhost:27017/Expense-Tracker` is reachable.
- Ensure `.env` exists in `expense-tracker-backend/` with a valid `JWT_SECRET`.

## 10) Deployment Notes
- For remote MongoDB (e.g., Atlas), update the `mongoose.connect(...)` URI in `expense-tracker-backend/index.js` and ensure IP allowlist and credentials are set.
- Set environment variables (`JWT_SECRET`, `PORT`) on your hosting platform.


