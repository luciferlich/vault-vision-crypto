# Deployment Guide

This guide will help you deploy your Cryptocurrency Portfolio Dashboard to various hosting platforms.

## 🚀 Quick Deploy Options

### 1. Vercel (Recommended - Free Tier Available)

**Why Vercel:**
- Zero configuration deployment
- Automatic HTTPS and CDN
- Excellent performance for React apps
- Free tier includes 100GB bandwidth

**Steps:**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up with GitHub
3. Click "New Project" and import your repository
4. Add environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_neon_database_url
   PGHOST=your_db_host
   PGPORT=5432
   PGDATABASE=your_db_name
   PGUSER=your_db_user
   PGPASSWORD=your_db_password
   ```
5. Deploy automatically!

### 2. Railway (Database + App Hosting)

**Why Railway:**
- Built-in PostgreSQL database
- Simple pricing ($5/month includes database)
- One-click deployment

**Steps:**
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add PostgreSQL service (automatically sets DATABASE_URL)
4. Deploy your app service
5. Railway handles the rest!

### 3. Render (Full-Stack Friendly)

**Why Render:**
- Free tier for web services
- Integrated PostgreSQL
- Docker support

**Steps:**
1. Create account at [render.com](https://render.com)
2. Create PostgreSQL database service
3. Create web service from GitHub repo
4. Set environment variables
5. Deploy

## 📊 Database Options

### Neon Database (Recommended)
- Serverless PostgreSQL
- Free tier: 1 database, 1GB storage
- Perfect for this application
- Get started: [neon.tech](https://neon.tech)

### Railway PostgreSQL
- Comes with Railway deployment
- $5/month includes app + database
- Easy setup

### Supabase
- Free tier with 500MB database
- Additional auth features if needed
- Get started: [supabase.com](https://supabase.com)

## 🔧 Environment Setup

Your application needs these environment variables:

```env
# Required - Database connection
DATABASE_URL=postgresql://user:password@host:port/database

# Required - Database credentials  
PGHOST=your_database_host
PGPORT=5432
PGDATABASE=your_database_name
PGUSER=your_username
PGPASSWORD=your_password

# Optional - Environment
NODE_ENV=production
```

## 🏗️ Build Configuration

The application is already configured for production deployment:

- **Build Command**: `npm run build` (already configured)
- **Start Command**: `npm start` (already configured)
- **Port**: Application auto-detects PORT environment variable

## 📱 Post-Deployment Steps

1. **Verify Database Connection**
   - Check application logs for successful database connection
   - Test portfolio creation functionality

2. **Test API Endpoints**
   - Verify crypto price fetching works
   - Test portfolio CRUD operations

3. **Performance Check**
   - Ensure simulations run within timeout limits
   - Verify chart rendering works correctly

## 🐛 Common Issues & Solutions

### Database Connection Errors
```bash
# Check your DATABASE_URL format
DATABASE_URL=postgresql://username:password@host:port/database
```

### Build Failures
```bash
# Ensure all dependencies are in package.json dependencies (not devDependencies)
npm install --save missing-package
```

### Port Issues
```bash
# Your hosting platform will set PORT automatically
# Application listens on process.env.PORT || 5000
```

## 💰 Cost Breakdown

### Free Tier Options:
- **Vercel**: Free (100GB bandwidth/month)
- **Neon Database**: Free (1GB storage)
- **Total**: $0/month

### Paid Options:
- **Railway**: $5/month (app + database)
- **Render**: $7/month (app) + $7/month (database)
- **Vercel Pro**: $20/month (more bandwidth)

## 🔄 CI/CD Setup

Your repository includes configuration for automatic deployments:

- Push to `main` branch = automatic deployment
- Environment variables configured once
- Build logs available in hosting dashboard

## 📞 Support

If you encounter issues:

1. Check hosting platform logs
2. Verify environment variables are set correctly
3. Ensure database is accessible
4. Test locally with production environment variables

**Ready to deploy? Choose your platform and follow the guide above!**