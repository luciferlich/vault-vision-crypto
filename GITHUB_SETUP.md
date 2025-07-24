# GitHub Setup Guide

Follow this step-by-step guide to move your project to GitHub and set up automatic deployment.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Your Replit project (this one!)

## 🔄 Method 1: Direct GitHub Export (Easiest)

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click the "+" icon → "New repository"
3. Name it: `crypto-portfolio-dashboard`
4. Set to **Public** (for free deployment) or **Private**
5. **Don't** initialize with README (we have files already)
6. Click "Create repository"

### Step 2: Download Your Replit Project
1. In Replit, click the three dots menu
2. Select "Download as zip"
3. Extract the zip file on your computer

### Step 3: Upload to GitHub
1. On your new GitHub repo page, click "uploading an existing file"
2. Drag and drop all your project files
3. Write commit message: "Initial commit - crypto portfolio dashboard"
4. Click "Commit changes"

## 🔄 Method 2: Git Commands (Advanced)

If you prefer using Git commands:

```bash
# Navigate to your extracted project folder
cd crypto-portfolio-dashboard

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - crypto portfolio dashboard"

# Add your GitHub repository as origin
git remote add origin https://github.com/yourusername/crypto-portfolio-dashboard.git

# Push to GitHub
git push -u origin main
```

## 🚀 Automatic Deployment Setup

Once your code is on GitHub, you can deploy to any platform:

### Option A: Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Click "New Project"
4. Select your `crypto-portfolio-dashboard` repository
5. Add environment variables (see DEPLOYMENT.md)
6. Click "Deploy"

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add PostgreSQL database
6. Deploy

### Option C: Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub account
3. Create new "Web Service"
4. Connect your repository
5. Add environment variables
6. Deploy

## 📁 Repository Structure

Your GitHub repository will include:

```
crypto-portfolio-dashboard/
├── README.md              # Project documentation
├── DEPLOYMENT.md          # Deployment guide
├── package.json           # Dependencies and scripts
├── vercel.json           # Vercel configuration
├── railway.json          # Railway configuration
├── render.yaml           # Render configuration
├── Dockerfile            # Docker configuration
├── .env.example          # Environment variables template
├── client/               # React frontend
├── server/               # Express backend
├── shared/               # Shared types and schemas
└── dist/                 # Production build (generated)
```

## 🔐 Environment Variables Setup

After deployment, add these environment variables in your hosting platform:

```env
DATABASE_URL=your_database_connection_string
PGHOST=your_database_host
PGPORT=5432
PGDATABASE=your_database_name
PGUSER=your_username
PGPASSWORD=your_password
```

## 🎯 Next Steps

1. **Deploy**: Choose a hosting platform and deploy
2. **Database**: Set up PostgreSQL database (Neon recommended)
3. **Test**: Verify the application works in production
4. **Monitor**: Check logs and performance

## ⚡ Quick Start Commands

After cloning your repository:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Push database schema
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔄 Continuous Deployment

Once connected:
- Push code to `main` branch = automatic deployment
- Pull requests create preview deployments
- Rollback available in hosting dashboard

## 📝 Repository Best Practices

### Commit Messages
```bash
git commit -m "feat: add jump-diffusion model visualization"
git commit -m "fix: resolve portfolio data persistence issue"
git commit -m "docs: update deployment instructions"
```

### Branching Strategy
```bash
# Create feature branch
git checkout -b feature/new-simulation-model

# Work on your feature, then merge
git checkout main
git merge feature/new-simulation-model
```

**Ready to go live? Push your code to GitHub and choose your deployment platform!**