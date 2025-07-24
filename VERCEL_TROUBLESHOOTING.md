# Vercel Deployment Troubleshooting

## Common Issues and Solutions for Crypto Portfolio Dashboard

### Issue: "Failed to fetch cryptocurrency prices"

This error occurs when the KuCoin API is not accessible from Vercel's serverless functions. Here are the solutions:

#### Solution 1: Check Vercel Function Logs
1. Go to your Vercel dashboard
2. Click on your project
3. Go to "Functions" tab
4. Check logs for specific errors

#### Solution 2: Verify API Endpoints
Test your deployed API directly:
```bash
# Test price endpoint
curl "https://your-app.vercel.app/api/crypto/prices?symbols=btc,eth"

# Test historical endpoint
curl "https://your-app.vercel.app/api/crypto/historical/BTC"
```

#### Solution 3: Environment Variables
Ensure these are set in Vercel dashboard:
```env
DATABASE_URL=your_postgresql_url
PGHOST=your_host
PGPORT=5432
PGDATABASE=your_database
PGUSER=your_username
PGPASSWORD=your_password
NODE_ENV=production
```

#### Solution 4: Function Timeout Issues
If functions are timing out, add this to `vercel.json`:
```json
{
  "functions": {
    "server/index.ts": {
      "maxDuration": 30
    }
  }
}
```

#### Solution 5: Alternative Vercel Configuration
Replace your `vercel.json` with this simpler version:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/public/$1"
    }
  ]
}
```

### Issue: Database Connection Failed

#### Solution: Check Database URL
1. Verify `DATABASE_URL` is correct in Vercel
2. Test connection from Vercel function logs
3. Ensure database allows external connections

#### Common Database URL Format:
```
postgresql://username:password@host:port/database?sslmode=require
```

### Issue: Build Failures

#### Solution: Check Build Logs
1. Go to Vercel dashboard → Deployments
2. Click failed deployment
3. Check build logs for specific errors

#### Common Build Issues:
- **TypeScript errors**: Fix type issues locally first
- **Missing dependencies**: Ensure all packages are in `dependencies`, not `devDependencies`
- **Environment variables**: Some may be needed at build time

### Issue: API Routes Not Working

#### Solution: Correct File Structure
Ensure your project structure matches:
```
server/
  index.ts      ← Main server file
  routes.ts     ← API routes
  db.ts         ← Database connection
```

#### Solution: Check Routing
Verify API routes are accessible:
- `/api/portfolio/assets`
- `/api/crypto/prices`
- `/api/crypto/historical/:symbol`

### Alternative Hosting Options

If Vercel continues to have issues:

#### Railway (Recommended Alternative)
1. Connect GitHub repository
2. Add PostgreSQL service
3. Deploy automatically
4. Cost: $5/month (includes database)

#### Render
1. Create web service from GitHub
2. Add PostgreSQL database
3. Set environment variables
4. Free tier available

### Testing API Locally vs Production

#### Local Test:
```bash
npm run dev
curl "http://localhost:5000/api/crypto/prices?symbols=btc"
```

#### Production Test:
```bash
curl "https://your-app.vercel.app/api/crypto/prices?symbols=btc"
```

### Debug Mode

Add this to your code for better debugging:
```typescript
console.log('Environment:', process.env.NODE_ENV);
console.log('Request URL:', req.url);
console.log('Request method:', req.method);
```

### Contact Points

If issues persist:
1. Check Vercel's status page
2. Verify KuCoin API is accessible
3. Test with a simple API first
4. Consider switching to Railway or Render

### Performance Optimization

For better reliability:
1. Add request timeouts
2. Implement fallback mechanisms  
3. Cache API responses
4. Use error boundaries in React

## Quick Fix Checklist

- [ ] Environment variables set correctly
- [ ] Database connection string valid
- [ ] API endpoints respond locally
- [ ] Build succeeds without TypeScript errors
- [ ] Vercel function logs show specific errors
- [ ] KuCoin API accessible from Vercel IPs