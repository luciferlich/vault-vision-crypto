# Portfolio Dashboard Application

## Overview
This is a full-stack cryptocurrency portfolio management application built with React (Vite) frontend and Express.js backend. The application allows users to track their crypto holdings, visualize portfolio data, and run advanced financial simulations using various stochastic models.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
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
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations in `migrations/` directory

### Environment Configuration
- **Development**: Uses Vite dev server with HMR and Express backend
- **Production**: Static files served by Express with API routes
- **Database**: Requires `DATABASE_URL` environment variable

### Deployment Requirements
- Node.js runtime with ES module support
- PostgreSQL database (Neon Database recommended)
- Environment variables for database connection
- Build artifacts in `dist/` directory

The application follows a monorepo structure with clear separation between client, server, and shared code. The architecture emphasizes type safety, developer experience, and scalable data management for financial applications.