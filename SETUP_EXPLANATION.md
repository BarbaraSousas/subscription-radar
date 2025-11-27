# Setup Explanation - Subscription Radar

This document explains every component that was created and how they work together.

## Project Overview

You now have a complete full-stack application with:
- **Backend**: FastAPI + PostgreSQL + SQLModel + JWT Auth
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with Alembic migrations

## Backend Architecture (FastAPI)

### 1. Core Configuration (`backend/app/core/`)

#### `config.py`
- **Purpose**: Centralized application settings
- **How it works**: Uses Pydantic's `BaseSettings` to load environment variables
- **Key settings**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `JWT_SECRET`: Secret key for signing JWT tokens
  - `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (24 hours by default)
  - `CORS_ORIGINS`: Allowed frontend origins for CORS

#### `security.py`
- **Purpose**: Security utilities for authentication
- **Key functions**:
  - `get_password_hash()`: Hash passwords using bcrypt (one-way, secure)
  - `verify_password()`: Verify plain password against hashed password
  - `create_access_token()`: Generate JWT tokens with user ID and expiration
  - `decode_access_token()`: Validate and decode JWT tokens
- **Why bcrypt?**: Industry standard, slow hash function (prevents brute force)
- **Why JWT?**: Stateless authentication, no server-side session storage needed

### 2. Database Layer (`backend/app/`)

#### `models.py`
- **Purpose**: Database table definitions
- **Technology**: SQLModel (combines SQLAlchemy + Pydantic)
- **Models**:
  - **User**: email, hashed_password, full_name, is_active, timestamps
  - **Subscription**: All subscription fields + relationship to User
- **Key concepts**:
  - `Field()`: Define column properties (unique, index, nullable)
  - `Relationship()`: Define foreign key relationships
  - `Enum`: Type-safe status and interval values
- **Why SQLModel?**: Get both ORM capabilities AND Pydantic validation in one

#### `schemas.py`
- **Purpose**: Request/response data validation
- **Technology**: Pydantic models
- **Why separate from models?**:
  - Models = database structure
  - Schemas = API interface (hide password, add computed fields)
- **Key schemas**:
  - `UserCreate`: For registration (includes plain password)
  - `UserResponse`: For responses (excludes password!)
  - `SubscriptionCreate/Update/Response`: Different schemas for different operations

#### `db.py`
- **Purpose**: Database connection management
- **Key components**:
  - `engine`: SQLAlchemy engine for database connection
  - `get_session()`: Dependency that provides database session to routes
  - `create_db_and_tables()`: Creates tables (for dev; use Alembic in production)
- **Connection pooling**: Maintains 5 connections, up to 10 max for performance

#### `deps.py`
- **Purpose**: FastAPI dependency injection
- **Key dependency**:
  - `get_current_user()`: Extracts JWT token, validates it, returns User object
  - Used in protected routes via `CurrentUser` type alias
- **How it works**:
  1. Extract bearer token from Authorization header
  2. Decode and validate JWT
  3. Fetch user from database
  4. Return user object to route handler

### 3. API Routes (`backend/app/api/v1/`)

#### `auth.py`
- **Endpoints**:
  - `POST /auth/register`: Create new user account
    - Checks if email exists
    - Hashes password before storing
    - Returns user object (without password)
  - `POST /auth/login`: Authenticate and get token
    - Verifies email and password
    - Returns JWT token
  - `GET /auth/me`: Get current user info (requires auth)

#### `subscriptions.py`
- **Endpoints**:
  - `POST /subscriptions`: Create new subscription
  - `GET /subscriptions`: List all subscriptions with filters
    - Supports filtering by status and category
    - Pagination with skip/limit
  - `GET /subscriptions/{id}`: Get single subscription
  - `PATCH /subscriptions/{id}`: Update subscription (partial update)
  - `DELETE /subscriptions/{id}`: Delete subscription
  - `GET /subscriptions/dashboard`: Get analytics
    - Calculates total monthly spend
    - Finds upcoming renewals (next 30 days)
    - Groups spending by category

**Important**: All subscription routes use `CurrentUser` dependency, ensuring:
- User must be authenticated
- Users can only see/modify their own subscriptions

### 4. Main Application (`backend/app/main.py`)

- **Purpose**: FastAPI application entry point
- **Configuration**:
  - CORS middleware: Allows Next.js frontend to call API
  - Lifespan events: Create tables on startup
  - Router inclusion: Registers auth and subscription routes
- **Endpoints**:
  - `GET /`: Root endpoint with API info
  - `GET /health`: Health check for monitoring
  - All `/api/v1/*` routes from routers

### 5. Database Migrations (`backend/alembic/`)

#### What is Alembic?
- Version control for your database schema
- Like Git, but for database structure
- Allows rolling forward/backward between schema versions

#### How it works:
1. You modify `models.py`
2. Run `alembic revision --autogenerate -m "description"`
3. Alembic compares current DB to models, creates migration file
4. Run `alembic upgrade head` to apply changes

#### `env.py` (configured)
- Imports your models
- Sets DATABASE_URL from settings
- Enables auto-generation of migrations

## Frontend Architecture (Next.js)

### 1. Configuration Files

#### `package.json`
- Lists all dependencies:
  - **next**: Framework
  - **react**: UI library
  - **typescript**: Type safety
  - **tailwindcss**: Styling
  - **axios**: HTTP client
  - **react-hook-form + zod**: Form handling with validation
  - **date-fns**: Date formatting

#### `tsconfig.json`
- TypeScript configuration
- `paths` alias: `@/*` maps to project root for imports
- `strict: true`: Maximum type safety

#### `tailwind.config.ts`
- Configures Tailwind CSS
- `content`: Tells Tailwind which files to scan for classes
- `theme.extend`: Custom colors, spacing, etc.

#### `next.config.js`
- Next.js configuration
- `reactStrictMode`: Highlights potential problems

### 2. App Structure (`web/app/`)

#### App Router (Next.js 14)
- Uses file-system based routing
- Each folder in `app/` becomes a route
- Special files:
  - `layout.tsx`: Wraps all pages
  - `page.tsx`: The page component
  - `loading.tsx`: Loading state (to be added)
  - `error.tsx`: Error boundary (to be added)

#### `layout.tsx`
- Root layout that wraps entire app
- Imports global CSS
- Sets up HTML structure
- **Metadata**: SEO tags for title and description

#### `page.tsx`
- Homepage component
- Shows welcome message with Login/Register buttons
- Uses Tailwind classes for styling

#### `globals.css`
- Imports Tailwind directives
- Defines CSS variables for theming
- Supports dark mode via `prefers-color-scheme`

### 3. Library Code (`web/lib/`)

#### `api.ts`
- **Purpose**: Centralized API client
- **How it works**:
  1. Creates axios instance with base URL
  2. Request interceptor: Automatically adds JWT token from localStorage
  3. Response interceptor: Handles 401 errors (redirects to login)
- **Exported APIs**:
  - `authAPI`: register, login, getCurrentUser
  - `subscriptionsAPI`: CRUD operations + dashboard
- **Why interceptors?**: DRY principle - auth logic in one place

### 4. Type Definitions (`web/types/`)

#### `index.ts`
- **Purpose**: TypeScript interfaces matching backend schemas
- **Key types**:
  - `User`, `Token`: Authentication
  - `Subscription`: Subscription data
  - `DashboardStats`: Analytics data
  - Enums for `IntervalType` and `SubscriptionStatus`
- **Why important?**: Type safety prevents bugs, autocomplete in IDE

## How Everything Connects

### 1. Authentication Flow

```
User fills form → Frontend validates with Zod
                ↓
    Frontend sends to /auth/register
                ↓
    Backend validates with Pydantic
                ↓
    Backend hashes password with bcrypt
                ↓
    Backend saves to PostgreSQL
                ↓
    Backend returns user object
                ↓
    Frontend redirects to login
                ↓
    User logs in → Backend verifies password
                ↓
    Backend creates JWT token
                ↓
    Frontend stores token in localStorage
                ↓
    All future requests include token
```

### 2. Subscription CRUD Flow

```
User creates subscription → Frontend validates form
                          ↓
    Frontend calls subscriptionsAPI.create()
                          ↓
    Axios interceptor adds JWT token
                          ↓
    Backend validates token in get_current_user()
                          ↓
    Backend validates data with Pydantic
                          ↓
    Backend saves to DB with user_id
                          ↓
    Backend returns created subscription
                          ↓
    Frontend updates UI
```

### 3. Dashboard Analytics Flow

```
User visits dashboard → Frontend calls getDashboard()
                      ↓
    Backend queries all user's subscriptions
                      ↓
    Backend calculates:
    - Monthly spend (handles different intervals)
    - Upcoming renewals (date range query)
    - Category breakdown (SQL GROUP BY)
                      ↓
    Backend returns DashboardStats
                      ↓
    Frontend renders charts and lists
```

## Key Concepts Explained

### 1. JWT (JSON Web Tokens)
- **What**: Encrypted string containing user data
- **Structure**: `header.payload.signature`
- **Benefits**:
  - Stateless (no server-side session storage)
  - Can't be tampered with (signature verification)
  - Includes expiration
- **How to read**: Decode at jwt.io (but not modify!)

### 2. Password Hashing
- **Never store plain passwords!**
- **Bcrypt process**:
  - User password → bcrypt hash → stored in DB
  - Login: Hash input password → compare hashes
- **Why secure**: Even with DB access, attacker can't get passwords

### 3. Database Relationships
- **Foreign Key**: `user_id` in subscriptions table references `users.id`
- **SQLModel Relationship**: `owner: User` allows accessing user data
- **Cascade behavior**: Can delete user → delete all their subscriptions

### 4. Dependency Injection (FastAPI)
- **Pattern**: Function receives dependencies automatically
- **Example**: `current_user: CurrentUser` in route
- **Benefits**: Clean code, easy testing, reusable logic

### 5. React Server Components (Next.js 14)
- **Default**: Components run on server
- **Benefits**:
  - Smaller bundle size
  - Direct DB access (if needed)
  - SEO friendly
- **Client components**: Use `'use client'` directive when needed

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/db_name
JWT_SECRET=super-secret-key-change-in-production
JWT_ALG=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Note**: `NEXT_PUBLIC_` prefix makes variable accessible in browser

## Security Best Practices Implemented

1. **Password Hashing**: Bcrypt with salt
2. **JWT Tokens**: Signed and verified
3. **CORS**: Restricted to specific origins
4. **SQL Injection Prevention**: Parameterized queries via SQLModel
5. **Input Validation**: Pydantic schemas on backend, Zod on frontend
6. **User Isolation**: Foreign keys ensure users only see their data
7. **HTTPS Ready**: Use environment variables for production URLs

## Database Schema Visualization

```
users
├── id (PK)
├── email (unique)
├── hashed_password
├── full_name
├── is_active
├── created_at
└── updated_at

subscriptions
├── id (PK)
├── user_id (FK → users.id)
├── name
├── vendor
├── category
├── amount
├── currency
├── interval (enum)
├── custom_interval_days
├── next_renewal_date
├── last_paid_at
├── start_date
├── status (enum)
├── tags
├── notes
├── created_at
└── updated_at
```

## Next Steps for Development

### Immediate Next Steps:
1. **Create .env files** from .example files
2. **Install dependencies** (see QUICKSTART.md)
3. **Create database** and run migrations
4. **Start both servers** and test the connection

### Frontend Pages to Build:
1. Login page (`/login`)
2. Register page (`/register`)
3. Dashboard page (`/dashboard`)
4. Subscriptions list page (`/subscriptions`)
5. Create/Edit subscription form

### Backend Enhancements:
1. Add email notifications
2. Implement scheduler for renewal reminders
3. Add CSV export endpoint
4. Add budget alerts
5. Implement filtering and sorting

### DevOps:
1. Add Docker Compose setup
2. Write tests (pytest + Jest)
3. Set up CI/CD pipeline
4. Deploy to cloud (Vercel + Railway/Heroku)

## Learning Resources

- **FastAPI**: https://fastapi.tiangolo.com/tutorial/
- **SQLModel**: https://sqlmodel.tiangolo.com/
- **Next.js**: https://nextjs.org/learn
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs/

## Troubleshooting

### Common Issues:

1. **Import errors**: Make sure virtual environment is activated
2. **Database connection**: Check PostgreSQL is running
3. **Port conflicts**: Change ports in commands
4. **CORS errors**: Verify CORS_ORIGINS in backend .env
5. **Token errors**: Check JWT_SECRET is set correctly

Happy coding! This is a solid foundation for learning full-stack development.
