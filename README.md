# Subscription Radar

A full-stack application for tracking and managing recurring subscriptions. Built as an educational project showcasing modern web development practices.

## Overview

Subscription Radar helps you track recurring expenses, set renewal reminders, forecast spending, and analyze your subscriptions by category. Never miss a renewal or lose track of your monthly spending again!

## Features

### Core Features (MVP)
- **User Authentication**: Email/password registration and login with JWT tokens
- **Subscription Management**: Full CRUD operations for subscriptions
  - Track name, vendor, category, amount, currency
  - Support for monthly, annual, or custom intervals
  - Add tags and notes for organization
- **Dashboard**: View upcoming renewals in the next 30 days
- **Analytics**:
  - Total monthly spend calculation
  - Spend breakdown by category
  - Active subscription count
- **Status Management**: Mark subscriptions as active, paused, or cancelled

### Tech Stack

**Frontend**:
- Next.js 14 (App Router with React Server Components)
- TypeScript for type safety
- Tailwind CSS for styling
- React Hook Form + Zod for form validation
- Axios for API communication

**Backend**:
- FastAPI (Python web framework)
- SQLModel (SQLAlchemy + Pydantic ORM)
- PostgreSQL database
- Alembic for database migrations
- JWT authentication with bcrypt password hashing

## Project Structure

```
subscription-radar/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── api/v1/      # API endpoints
│   │   ├── core/        # Config & security
│   │   ├── models.py    # Database models
│   │   ├── schemas.py   # Pydantic schemas
│   │   ├── db.py        # Database connection
│   │   └── main.py      # FastAPI app
│   ├── alembic/         # Database migrations
│   ├── requirements.txt
│   └── README.md
│
└── web/                 # Next.js frontend
    ├── app/             # App router pages
    ├── components/      # React components
    ├── lib/             # Utilities & API client
    ├── types/           # TypeScript types
    ├── package.json
    └── README.md (to be created)
```

## Getting Started

### Prerequisites

- **Python 3.10+** for backend
- **Node.js 18+** for frontend
- **PostgreSQL 14+** database
- **npm** or **yarn** package manager

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # macOS/Linux
   # or .venv\Scripts\activate on Windows
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env and update:
   # - DATABASE_URL (PostgreSQL connection string)
   # - JWT_SECRET (generate with: openssl rand -hex 32)
   ```

5. **Create database**:
   ```bash
   createdb subscription_radar
   ```

6. **Run migrations**:
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   ```

7. **Start the server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at http://localhost:8000
   - Interactive API docs: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to web directory**:
   ```bash
   cd web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Default API URL is http://localhost:8000/api/v1
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The web app will be available at http://localhost:3000

## Architecture Overview

### Database Schema

**users** table:
- id (primary key)
- email (unique)
- hashed_password
- full_name
- is_active
- created_at, updated_at

**subscriptions** table:
- id (primary key)
- user_id (foreign key)
- name, vendor, category
- amount, currency
- interval (monthly/annual/custom)
- custom_interval_days
- next_renewal_date, last_paid_at, start_date
- status (active/cancelled/paused)
- tags, notes
- created_at, updated_at

### API Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (returns JWT token)
- `GET /api/v1/auth/me` - Get current user

#### Subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `GET /api/v1/subscriptions` - List subscriptions (supports filtering & pagination)
- `GET /api/v1/subscriptions/{id}` - Get subscription by ID
- `PATCH /api/v1/subscriptions/{id}` - Update subscription
- `DELETE /api/v1/subscriptions/{id}` - Delete subscription
- `GET /api/v1/subscriptions/dashboard` - Get dashboard analytics

### Authentication Flow

1. User registers via `/auth/register`
2. User logs in via `/auth/login` and receives JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include token in `Authorization: Bearer <token>` header
5. Backend validates token and returns user-specific data

### Key Design Patterns

**Backend**:
- **Dependency Injection**: FastAPI's Depends for database sessions and auth
- **Repository Pattern**: SQLModel for database operations
- **DTO Pattern**: Pydantic schemas for request/response validation
- **Middleware**: CORS, error handling, logging

**Frontend**:
- **Server Components**: Next.js App Router for better performance
- **API Client**: Axios with interceptors for auth and error handling
- **Type Safety**: TypeScript interfaces matching backend schemas
- **Component Composition**: Reusable React components

## Development Workflow

### Making Database Changes

1. Update models in `backend/app/models.py`
2. Generate migration: `alembic revision --autogenerate -m "Description"`
3. Review the generated migration in `backend/alembic/versions/`
4. Apply migration: `alembic upgrade head`
5. Update TypeScript types in `web/types/index.ts` to match

### Adding New API Endpoints

1. Define Pydantic schemas in `backend/app/schemas.py`
2. Add endpoint in appropriate router (e.g., `backend/app/api/v1/subscriptions.py`)
3. Update frontend API client in `web/lib/api.ts`
4. Create/update React components to use the new endpoint

## Educational Value

This project demonstrates:

### Backend Skills
- **FastAPI**: Modern async Python web framework
- **SQLModel**: Type-safe ORM combining SQLAlchemy and Pydantic
- **Database Migrations**: Alembic for version control of database schema
- **Authentication**: JWT tokens with secure password hashing
- **API Design**: RESTful endpoints with proper status codes
- **Data Validation**: Pydantic models for request/response validation
- **Dependency Injection**: Clean architecture with FastAPI's DI system

### Frontend Skills
- **Next.js 14**: App Router with React Server Components
- **TypeScript**: Full type safety across the application
- **Form Handling**: React Hook Form with Zod validation
- **API Integration**: Axios client with interceptors
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and context (for future auth provider)

### General Software Engineering
- **Monorepo Structure**: Organized codebase with clear separation
- **Environment Configuration**: Proper secrets management
- **Error Handling**: Comprehensive error handling on both client and server
- **Documentation**: Well-documented code and setup instructions
- **Security Best Practices**: Password hashing, JWT tokens, CORS, SQL injection prevention

## Next Steps / Stretch Goals

- [ ] Add authentication context provider in Next.js
- [ ] Create login and register pages
- [ ] Build dashboard page with charts
- [ ] Implement subscription list with filters
- [ ] Add subscription create/edit forms
- [ ] Email notifications for upcoming renewals
- [ ] CSV export functionality
- [ ] Budget caps and alerts
- [ ] Dark mode toggle
- [ ] Mobile-responsive design improvements
- [ ] Unit and integration tests
- [ ] Docker compose setup
- [ ] CI/CD pipeline

## Contributing

This is an educational project. Feel free to fork, experiment, and learn!

## License

MIT License - feel free to use this project for learning purposes.

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
