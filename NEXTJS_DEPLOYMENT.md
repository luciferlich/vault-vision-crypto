# Next.js Deployment Guide for Crypto Portfolio Dashboard

Your application is now properly configured for Next.js deployment on Vercel.

## ✅ What I've Fixed

### 1. **Next.js API Routes Structure**
- Created proper App Router API routes in `app/api/` directory
- Fixed API route exports to use `GET` function instead of default handlers
- Added proper `NextRequest` and `NextResponse` types

### 2. **Vercel Configuration**
- Updated `vercel.json` for Next.js compatibility
- Removed conflicting builds/functions configuration
- Set proper function timeout for API routes

### 3. **Environment Setup**
- Added `next.config.js` with proper environment variable configuration
- Configured external packages for serverless functions

## 🚀 Deployment Steps

### Step 1: Push to GitHub
1. Download your project from Replit
2. Create new GitHub repository: `crypto-portfolio-dashboard`
3. Upload all files to GitHub

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" → Import your repository
3. Vercel will automatically detect it's a Next.js app
4. No build configuration needed - Next.js is auto-detected

### Step 3: Add Environment Variables
In Vercel dashboard, add these environment variables:
```
DATABASE_URL=your_postgresql_connection_string
PGHOST=your_database_host
PGPORT=5432
PGDATABASE=your_database_name
PGUSER=your_username
PGPASSWORD=your_password
```

### Step 4: Deploy
- Click "Deploy" - Vercel handles everything automatically
- Your API routes will be available at:
  - `https://your-app.vercel.app/api/crypto/prices?symbols=btc,eth`
  - `https://your-app.vercel.app/api/crypto/historical/BTC`

## 📁 New File Structure

```
app/
├── api/
│   └── crypto/
│       ├── prices/
│       │   └── route.ts           # GET /api/crypto/prices
│       └── historical/
│           └── [symbol]/
│               └── route.ts       # GET /api/crypto/historical/[symbol]
├── next.config.js                 # Next.js configuration
└── vercel.json                    # Vercel deployment config
```

## 🔧 API Improvements

### Enhanced Error Handling
- Added request timeouts (10s for prices, 15s for historical)
- Fallback endpoints for better reliability
- Detailed error messages with status codes
- Production-ready logging

### Crypto Price API (`/api/crypto/prices`)
- Supports multiple symbols: `?symbols=btc,eth,xrp`
- Returns structured data with price, change24h, volume24h
- Fallback to alternative KuCoin endpoint if primary fails

### Historical Data API (`/api/crypto/historical/[symbol]`)
- Returns 365 days of historical price data
- Proper data validation and filtering
- Error responses instead of mock data

## 🐛 Troubleshooting

### If API Routes Still Fail:
1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Functions
   - Look for specific error messages

2. **Test API Endpoints Directly**:
   ```bash
   curl "https://your-app.vercel.app/api/crypto/prices?symbols=btc"
   ```

3. **Verify Environment Variables**:
   - Ensure all database credentials are set in Vercel
   - Check for typos in variable names

### Common Issues:
- **Function Timeout**: Increased to 30 seconds in vercel.json
- **CORS Issues**: Resolved with proper headers in API routes
- **Database Connection**: Ensure DATABASE_URL is correctly formatted

## 🎯 Testing Your Deployment

After deployment, test these endpoints:

```bash
# Test crypto prices
curl "https://your-app.vercel.app/api/crypto/prices?symbols=btc,eth,xrp"

# Test historical data
curl "https://your-app.vercel.app/api/crypto/historical/BTC"

# Test portfolio (requires database)
curl "https://your-app.vercel.app/api/portfolio/assets"
```

## 💡 Next Steps

1. **Database Setup**: Create PostgreSQL database on Neon (free)
2. **Portfolio API**: You'll need to create portfolio API routes in Next.js format
3. **Frontend**: Ensure your React components work with new API structure

Your crypto portfolio dashboard is now ready for production deployment on Vercel! 🚀