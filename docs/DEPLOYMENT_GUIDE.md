# CHOCKY'S Glamour - Deployment Guide

This guide covers deploying the CHOCKY'S Glamour e-commerce platform to Vercel with a MySQL database.

## Prerequisites

- GitHub account with the repository pushed
- Vercel account (free tier works)
- MySQL database provider (PlanetScale, Railway, or other)

---

## Step 1: Set Up MySQL Database

### Option A: PlanetScale (Recommended - Free Tier Available)

1. Go to [PlanetScale](https://planetscale.com/) and create an account
2. Create a new database named `chockys_glamour`
3. Go to **Connect** → **Create password**
4. Select **Prisma** as the connection method
5. Copy the `DATABASE_URL` connection string

### Option B: Railway

1. Go to [Railway](https://railway.app/) and create an account
2. Create a new project → Add MySQL
3. Go to **Variables** tab and copy the `DATABASE_URL`

### Option C: Aiven (Free Tier)

1. Go to [Aiven](https://aiven.io/) and create an account
2. Create a MySQL service
3. Copy the connection string from the service overview

---

## Step 2: Deploy to Vercel

### Method 1: Import from GitHub (Recommended)

1. Go to [Vercel](https://vercel.com/) and sign in with GitHub
2. Click **Add New** → **Project**
3. Import the `CHOCKY-S_GLAMOUR_UNISEX_SALON` repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm install`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from the project directory
cd chockys-glamour
vercel
```

---

## Step 3: Configure Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db?sslaccept=strict` |
| `NEXTAUTH_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Generate with `openssl rand -base64 32` |

### Optional Variables (for full functionality)

| Variable | Description |
|----------|-------------|
| `MTN_MOMO_API_KEY` | MTN Mobile Money API key |
| `AIRTEL_MONEY_API_KEY` | Airtel Money API key |
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `SMTP_HOST` | Email SMTP host |
| `SMTP_USER` | Email SMTP username |
| `SMTP_PASSWORD` | Email SMTP password |

---

## Step 4: Initialize Database

After deployment, you need to push the Prisma schema and seed the database.

### Option A: Using Vercel CLI

```bash
# Connect to your Vercel project
vercel link

# Pull environment variables
vercel env pull .env.local

# Push schema to database
npx prisma db push

# Seed the database (optional)
npm run db:seed
```

### Option B: Using Vercel Functions

The database schema will be automatically applied during the first build because of the `prisma generate` in the build command.

For seeding, you can create a one-time API route or use Prisma Studio:

```bash
# Open Prisma Studio to manage data
npx prisma studio
```

---

## Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Check the following pages work:
   - Homepage: `/`
   - Shop: `/shop`
   - Salon: `/salon`
   - Admin: `/admin` (login with admin@chockys.com / admin123)

---

## Database Schema Migration

When you make changes to `prisma/schema.prisma`:

```bash
# Generate migration
npx prisma migrate dev --name your_migration_name

# Push to production
npx prisma db push
```

---

## Troubleshooting

### Build Fails with Prisma Error

Make sure `prisma generate` runs before `next build`:
```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Database Connection Error

1. Check `DATABASE_URL` is correctly set in Vercel
2. Ensure SSL is enabled: `?sslaccept=strict`
3. Verify the database is accessible from Vercel's IP ranges

### NextAuth Errors

1. Ensure `NEXTAUTH_URL` matches your deployment URL exactly
2. Generate a new `NEXTAUTH_SECRET` if needed:
   ```bash
   openssl rand -base64 32
   ```

---

## Production Checklist

- [ ] Database is set up and accessible
- [ ] All environment variables are configured
- [ ] Prisma schema is pushed to database
- [ ] Admin user is created
- [ ] Sample products are seeded (optional)
- [ ] Custom domain is configured (optional)
- [ ] SSL certificate is active

---

## Custom Domain Setup

1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `shop.chockys.com`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

---

## Monitoring & Analytics

Vercel provides built-in analytics. For additional monitoring:

1. Enable Vercel Analytics in project settings
2. Add Google Analytics ID to environment variables
3. Monitor function logs in Vercel Dashboard → Logs

---

## Support

For issues with deployment:
- Vercel Documentation: https://vercel.com/docs
- Prisma Documentation: https://www.prisma.io/docs
- Next.js Documentation: https://nextjs.org/docs

---

*Last Updated: February 2025*
