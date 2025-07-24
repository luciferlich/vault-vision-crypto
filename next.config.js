/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    PGHOST: process.env.PGHOST,
    PGPORT: process.env.PGPORT,
    PGDATABASE: process.env.PGDATABASE,
    PGUSER: process.env.PGUSER,
    PGPASSWORD: process.env.PGPASSWORD,
  }
}

module.exports = nextConfig