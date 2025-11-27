# Quick Start Guide

Get the Subscription Radar app running in 5 minutes!

## Prerequisites

Make sure you have installed:
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd subscription-radar
```

### 2. Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and set a strong JWT_SECRET (e.g., use: openssl rand -hex 32)

# Create database
createdb subscription_radar

# Run migrations
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload
```

Backend will run at: **http://localhost:8000**
API docs at: **http://localhost:8000/docs**

### 3. Frontend Setup (Terminal 2)

```bash
# Navigate to web directory (from project root)
cd web

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# No changes needed for local development

# Start frontend server
npm run dev
```

Frontend will run at: **http://localhost:3000**

## First Steps

1. Open http://localhost:3000 in your browser
2. Click "Register" to create an account
3. Fill in your email and password
4. Log in with your credentials
5. Start tracking your subscriptions!

## Testing the API

You can also test the API directly at http://localhost:8000/docs

Example requests:

1. **Register**: POST `/api/v1/auth/register`
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "full_name": "Test User"
   }
   ```

2. **Login**: POST `/api/v1/auth/login`
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Create Subscription**: POST `/api/v1/subscriptions` (use token from login)
   ```json
   {
     "name": "Netflix",
     "category": "Entertainment",
     "amount": 15.99,
     "currency": "USD",
     "interval": "monthly",
     "next_renewal_date": "2025-12-01"
   }
   ```

## Common Issues

### Port Already in Use
- Backend: Change port with `uvicorn app.main:app --reload --port 8001`
- Frontend: Next.js will auto-suggest alternative port

### Database Connection Error
- Make sure PostgreSQL is running: `pg_ctl status` or `brew services list`
- Check DATABASE_URL in backend/.env

### Module Not Found
- Backend: Make sure virtual environment is activated
- Frontend: Run `npm install` again

## Next Steps

- Read the full [README.md](README.md) for architecture details
- Check [backend/README.md](backend/README.md) for API documentation
- Explore the interactive API docs at http://localhost:8000/docs
- Build out the frontend pages (login, register, dashboard)

## Stopping the Servers

- Press `Ctrl+C` in each terminal to stop the servers
- Deactivate Python virtual environment: `deactivate`

Enjoy building with Subscription Radar!
