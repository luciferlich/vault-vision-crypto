# Portfolio Dashboard Application

## Overview
This is a full-stack cryptocurrency portfolio management application built with React (Vite) frontend and Express.js backend. The application allows users to track their crypto holdings, visualize portfolio data, and run advanced financial simulations using various stochastic models.

## User Preferences
Preferred communication style: Simple, everyday language.
Deployment preference: GitHub integration and external hosting required.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js with React 18 and TypeScript
- **Build Tool**: Next.js built-in bundling and optimization
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful endpoints under `/api` namespace
- **Middleware**: Custom logging, JSON parsing, and error handling

### Data Storage
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured via Drizzle config)
- **Connection**: Neon Database serverless connection
- **Development Storage**: In-memory storage fallback for development

## Key Components

### Portfolio Management
- **Asset Tracking**: CRUD operations for portfolio assets (symbol, quantity, entry price)
- **Real-time Pricing**: Integration with KuCoin API for live cryptocurrency prices
- **Portfolio Analytics**: Total value, P&L calculations, allocation percentages

### Financial Simulation Engine
- **Stochastic Models**: 
  - Geometric Brownian Motion (GBM)
  - Jump Diffusion
  - Heston Stochastic Volatility
  - GARCH
  - Stable Levy Process
  - Regime Switching
- **Monte Carlo Simulations**: Configurable number of paths and time horizons
- **Statistical Analysis**: Risk metrics, return distributions, and visualization

### UI/UX Design System
- **Theme**: Professional dark theme optimized for crypto trading
- **Color Palette**: Electric blue primary with neutral grays
- **Typography**: Clean, readable fonts with consistent spacing
- **Components**: Comprehensive set of reusable UI components

## Data Flow

### Client-Server Communication
1. Frontend makes API requests to Express backend
2. Backend validates requests using Zod schemas
3. Data persistence through Drizzle ORM to PostgreSQL
4. Real-time market data fetched from external APIs
5. Simulation results computed server-side and streamed to client

### State Management Flow
1. TanStack Query manages server state with automatic caching
2. Custom hooks encapsulate business logic (crypto data, simulations)
3. React Context provides global state where needed
4. Local component state for UI interactions

## External Dependencies

### Third-Party APIs
- **KuCoin API**: Real-time cryptocurrency prices and market data
- **Historical Data**: Price history for simulation model calibration

### Key Libraries
- **Database**: `@neondatabase/serverless`, `drizzle-orm`
- **UI Components**: `@radix-ui/*` primitives, `class-variance-authority`
- **Data Fetching**: `@tanstack/react-query`
- **Validation**: `zod`, `drizzle-zod`
- **Charts**: `recharts` for data visualization
- **Styling**: `tailwindcss`, `clsx`

## Deployment Strategy

### Build Process
- **Frontend**: Next.js builds optimized static assets and server functions
- **Backend**: Serverless functions deployed to Vercel Edge Network
- **Database**: Drizzle migrations in `migrations/` directory

### Environment Configuration
- **Development**: Next.js dev server with API routes and Express backend
- **Production**: Serverless deployment on Vercel with edge functions
- **Database**: Requires `DATABASE_URL` environment variable

### Deployment Requirements
- Node.js runtime with ES module support
- PostgreSQL database (Neon Database recommended)
- Environment variables for database connection
- Build artifacts in `dist/` directory

The application follows a monorepo structure with clear separation between client, server, and shared code. The architecture emphasizes type safety, developer experience, and scalable data management for financial applications.

## Recent Changes (January 2025)
- ✓ Implemented model-specific visualizations for financial simulations
- ✓ Created unique charts for each stochastic model (Jump-Diffusion, Heston, GARCH, Stable Lévy, Regime-Switching)
- ✓ Fixed simulation engine to return model-specific parameters and analysis
- ✓ Database integration with PostgreSQL for persistent portfolio data
- ✓ Real-time crypto pricing with KuCoin API integration
- → Preparing for GitHub deployment and external hosting