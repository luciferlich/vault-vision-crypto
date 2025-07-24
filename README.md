# Cryptocurrency Portfolio Dashboard

A comprehensive cryptocurrency portfolio management application with advanced financial simulations and real-time market data.

## Features

### Portfolio Management
- 📊 Real-time cryptocurrency price tracking
- 💼 Portfolio asset management (add, edit, delete holdings)
- 📈 Live P&L calculations and performance metrics
- 💾 Persistent data storage with PostgreSQL

### Advanced Financial Simulations
- 🎯 **6 Stochastic Models** with model-specific visualizations:
  - **Geometric Brownian Motion (GBM)**: Classic lognormal distribution analysis
  - **Jump-Diffusion**: Price jump analysis and impact distribution
  - **Heston Model**: Stochastic volatility evolution and clustering
  - **GARCH**: Volatility persistence and heteroskedasticity patterns
  - **Stable Lévy Process**: Heavy-tailed distribution characteristics
  - **Regime-Switching**: Bull/bear market transition analysis

### Real-time Data & Analytics
- 🔄 Live crypto prices via KuCoin API
- 📊 Monte Carlo simulations (up to 10,000 paths)
- 📈 Interactive charts with confidence intervals
- 🎨 Model-specific parameter analysis

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Shadcn/ui, Tailwind CSS
- **Charts**: Recharts
- **State Management**: TanStack Query

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables (see below)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd crypto-portfolio-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
PGHOST=your_host
PGPORT=5432
PGDATABASE=your_database
PGUSER=your_username
PGPASSWORD=your_password
```

4. **Push database schema**
```bash
npm run db:push
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Database Setup

This application uses PostgreSQL with Drizzle ORM. You can use:
- **Neon Database** (recommended for production)
- **Local PostgreSQL** 
- **Railway** or **Supabase**

## Deployment Options

### Option 1: Vercel (Recommended)
1. Fork this repository to your GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on git push

### Option 2: Railway
1. Connect your GitHub repository
2. Add PostgreSQL service
3. Set environment variables
4. Deploy with zero configuration

### Option 3: Render
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set start command: `npm start`
4. Add environment variables

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `PGHOST` | Database host | ✅ |
| `PGPORT` | Database port (default: 5432) | ✅ |
| `PGDATABASE` | Database name | ✅ |
| `PGUSER` | Database username | ✅ |
| `PGPASSWORD` | Database password | ✅ |

## API Endpoints

### Portfolio Management
- `GET /api/portfolio` - Get all portfolio assets
- `POST /api/portfolio` - Add new asset
- `PUT /api/portfolio/:id` - Update asset
- `DELETE /api/portfolio/:id` - Delete asset

### Market Data
- `GET /api/crypto/prices` - Get current crypto prices
- `GET /api/crypto/historical/:symbol` - Get historical price data

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configs
│   │   └── pages/          # Page components
├── server/                 # Express backend
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data access layer
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema
└── dist/                  # Production build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for the crypto community**