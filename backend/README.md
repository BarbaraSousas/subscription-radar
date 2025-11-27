# Subscription Radar - Backend API

FastAPI backend for tracking recurring subscriptions.

## Tech Stack

- **FastAPI**: Modern Python web framework
- **SQLModel**: SQL database ORM (built on SQLAlchemy + Pydantic)
- **PostgreSQL**: Database
- **Alembic**: Database migrations
- **JWT**: Authentication via JSON Web Tokens
- **Pydantic**: Data validation

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py           # Authentication endpoints
│   │       └── subscriptions.py  # Subscription CRUD + analytics
│   ├── core/
│   │   ├── config.py            # Settings & environment config
│   │   └── security.py          # JWT & password hashing
│   ├── models.py                # SQLModel database models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── db.py                    # Database connection & session
│   ├── deps.py                  # FastAPI dependencies
│   └── main.py                  # FastAPI application
├── alembic/                     # Database migrations
├── requirements.txt             # Python dependencies
└── .env                         # Environment variables (create from .env.example)
```

## Setup Instructions

### 1. Install Dependencies

Make sure you have Python 3.10+ and PostgreSQL installed.

```bash
# Create virtual environment (if not already created)
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and update these values:
# - DATABASE_URL: Your PostgreSQL connection string
# - JWT_SECRET: A strong random secret key (use: openssl rand -hex 32)
```

### 3. Set Up Database

```bash
# Make sure PostgreSQL is running

# Create database
createdb subscription_radar

# Run migrations (auto-generate initial schema)
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 4. Run the Server

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --port 8000

# Or use the built-in runner
python -m app.main
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user info

### Subscriptions

- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/subscriptions` - List all subscriptions (with filters)
- `GET /api/v1/subscriptions/{id}` - Get subscription by ID
- `PATCH /api/v1/subscriptions/{id}` - Update subscription
- `DELETE /api/v1/subscriptions/{id}` - Delete subscription
- `GET /api/v1/subscriptions/dashboard` - Get dashboard analytics

## Database Models

### User
- Email (unique)
- Password (hashed with bcrypt)
- Full name
- Active status

### Subscription
- Name, vendor, category
- Amount, currency
- Interval (monthly/annual/custom)
- Next renewal date
- Status (active/cancelled/paused)
- Tags, notes
- Relationships to User

## Key Features

### Authentication
- JWT-based authentication with Bearer tokens
- Password hashing with bcrypt
- Token expiration (configurable)

### Subscriptions
- Full CRUD operations
- Filter by status and category
- Pagination support
- Per-user data isolation

### Analytics
- Total monthly spend calculation
- Upcoming renewals (next 30 days)
- Spend breakdown by category
- Active subscription count

## Development

### Creating Database Migrations

```bash
# After modifying models.py, create a new migration:
alembic revision --autogenerate -m "Description of changes"

# Apply the migration:
alembic upgrade head

# Rollback last migration:
alembic downgrade -1
```

### Testing the API

Use the interactive docs at http://localhost:8000/docs

Or use curl:

```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "full_name": "Test User"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Create subscription (use token from login)
curl -X POST http://localhost:8000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Netflix",
    "vendor": "Netflix Inc",
    "category": "Entertainment",
    "amount": 15.99,
    "currency": "USD",
    "interval": "monthly",
    "next_renewal_date": "2025-12-01"
  }'
```

## Security Notes

- Always use a strong `JWT_SECRET` in production
- Never commit `.env` file to version control
- Use HTTPS in production
- Consider rate limiting for auth endpoints
- Regularly update dependencies for security patches

## Production Deployment

1. Set `echo=False` in `db.py` (disable SQL logging)
2. Use a strong JWT secret
3. Configure proper CORS origins
4. Use a production WSGI server (uvicorn with multiple workers)
5. Set up proper logging and monitoring
6. Use environment variables for all secrets
7. Enable HTTPS/TLS

```bash
# Production server example
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```
