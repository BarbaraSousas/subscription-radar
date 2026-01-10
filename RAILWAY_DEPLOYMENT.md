# Railway Deployment Guide

Deploy your Subscription Radar app to Railway for **FREE**!

## Prerequisites

1. GitHub account
2. Railway account (sign up at [railway.app](https://railway.app) - free $5/month credit)
3. Your code pushed to a GitHub repository

## Step-by-Step Deployment

### 1. Push Your Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/subscription-radar.git
git branch -M main
git push -u origin main
```

### 2. Set Up Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Select your `subscription-radar` repository
5. Railway will detect your project structure

### 3. Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically create a database and provide a `DATABASE_URL`
4. The `DATABASE_URL` will be automatically available to your backend service

### 4. Deploy Backend Service

1. Click **"+ New"** → **"Service"** → Select your GitHub repo
2. Set the **Root Directory** to `backend`
3. Railway will auto-detect Python and use the `railway.toml` config

#### Configure Backend Environment Variables:

In the backend service settings, add these variables:

```bash
# JWT_SECRET - Generate a secure key!
JWT_SECRET=<run: openssl rand -hex 32>

# JWT_ALG
JWT_ALG=HS256

# ACCESS_TOKEN_EXPIRE_MINUTES
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS_ORIGINS - Add your frontend URL (update after deploying frontend)
CORS_ORIGINS=["https://your-frontend-name.up.railway.app"]

# DATABASE_URL is automatically provided by Railway PostgreSQL plugin
```

**Generate JWT_SECRET:**
```bash
openssl rand -hex 32
```
Copy the output and use it as your `JWT_SECRET`.

#### Run Database Migrations:

1. In the backend service, go to **Settings** → **Deployments**
2. After the first deployment, open the service **shell/terminal**
3. Run:
```bash
alembic upgrade head
```

### 5. Deploy Frontend Service

1. Click **"+ New"** → **"Service"** → Select your GitHub repo
2. Set the **Root Directory** to `web`
3. Railway will auto-detect Next.js and use the `railway.toml` config

#### Configure Frontend Environment Variables:

In the frontend service settings, add:

```bash
# BACKEND_URL - Use your backend Railway URL
BACKEND_URL=https://your-backend-name.up.railway.app

# NEXT_PUBLIC_API_URL - Use your backend Railway URL
NEXT_PUBLIC_API_URL=https://your-backend-name.up.railway.app/api/v1
```

**To get your backend URL:**
- Go to your backend service
- Click on **Settings** → **Networking**
- Copy the generated domain (e.g., `your-backend-name.up.railway.app`)

### 6. Update CORS Settings

After deploying the frontend:

1. Go to backend service settings
2. Update the `CORS_ORIGINS` environment variable:
```bash
CORS_ORIGINS=["https://your-frontend-name.up.railway.app"]
```
3. The backend will automatically redeploy

### 7. Access Your App

- **Frontend:** `https://your-frontend-name.up.railway.app`
- **Backend API:** `https://your-backend-name.up.railway.app`
- **API Docs:** `https://your-backend-name.up.railway.app/docs`

## Automatic Deployments

Railway automatically deploys when you push to your GitHub repository's main branch!

```bash
git add .
git commit -m "Update feature"
git push
```

Both frontend and backend will redeploy automatically.

## Custom Domains (Optional)

In each service's settings:
1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"** or add your own custom domain
3. Update environment variables accordingly

## Monitoring & Logs

- **View Logs:** Click on any service → **Deployments** tab
- **Metrics:** Railway dashboard shows CPU, memory, and network usage
- **Health Check:** Backend has `/health` endpoint for monitoring

## Database Management

### Connect to PostgreSQL:

1. In Railway dashboard, click on your PostgreSQL database
2. Click **"Connect"** tab
3. Use the connection details with any PostgreSQL client (pgAdmin, DBeaver, etc.)

### Run Migrations:

```bash
# Option 1: Via Railway shell
# Open backend service → Shell → Run:
alembic upgrade head

# Option 2: Locally with Railway CLI
railway run alembic upgrade head
```

## Troubleshooting

### Backend Won't Start
- Check environment variables are set correctly
- Verify `DATABASE_URL` is available (PostgreSQL plugin added)
- Check logs in Railway dashboard

### CORS Errors
- Verify `CORS_ORIGINS` includes your frontend URL
- Make sure the URL format is correct: `["https://..."]` (JSON array)
- No trailing slashes in URLs

### Database Connection Issues
- Ensure PostgreSQL service is running
- Verify `DATABASE_URL` environment variable exists
- Check that migrations have been run

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend service is running
- Test backend health: `https://your-backend.up.railway.app/health`

## Cost & Limits

Railway free tier includes:
- **$5/month** in free credits
- 500 hours of execution time
- 100 GB egress bandwidth

This is typically enough for:
- Small to medium projects
- Development/staging environments
- Personal projects with moderate traffic

## Next Steps

1. Set up custom domains
2. Add monitoring/alerting
3. Configure auto-scaling (if needed on paid tier)
4. Set up staging/production environments
5. Add CI/CD tests before deployment

## Useful Commands

```bash
# Install Railway CLI (optional)
npm i -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run commands in Railway environment
railway run alembic upgrade head

# View logs
railway logs

# Open service in browser
railway open
```

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Report issues in your repository

---

**Enjoy your deployed Subscription Radar app!** 🚀
