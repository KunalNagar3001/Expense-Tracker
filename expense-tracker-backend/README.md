# Expense Tracker Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in this directory with:
   ```env
   JWT_SECRET=supersecretkey123
   PORT=5000
   ```
3. Start the server:
   ```bash
   npm start
   ```

## API

### POST /login
- Body: `{ "email": "user@example.com", "password": "password123" }`
- Returns: `{ token: <jwt> }` on success

## Demo User
- **Email:** user@example.com
- **Password:** password123 