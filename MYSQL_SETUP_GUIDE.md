# MySQL Database Setup Guide for CHOCKY'S Glamour

This guide will help you set up a MySQL database for your CHOCKY'S Glamour website deployed on Vercel.

## Option 1: PlanetScale (Recommended - Free Tier Available)

PlanetScale is a serverless MySQL database that works seamlessly with Vercel.

### Step 1: Create a PlanetScale Account
1. Go to [https://planetscale.com](https://planetscale.com)
2. Click "Get Started Free"
3. Sign up with GitHub or email

### Step 2: Create a Database
1. Click "Create a database"
2. Name it: `chockys-glamour`
3. Select a region closest to your users (e.g., `us-east-1` or `eu-west-1`)
4. Click "Create database"

### Step 3: Get Connection String
1. Go to your database dashboard
2. Click "Connect"
3. Select "Prisma" from the dropdown
4. Copy the connection string (it looks like):
   ```
   mysql://username:password@host.planetscale.com/chockys-glamour?sslaccept=strict
   ```

### Step 4: Add Environment Variables to Vercel
Run these commands in your terminal:

```bash
cd chockys-glamour

# Add DATABASE_URL
vercel env add DATABASE_URL

# When prompted, paste your PlanetScale connection string
# Select: Production, Preview, Development

# Add NEXTAUTH_SECRET (generate a random secret)
vercel env add NEXTAUTH_SECRET
# Paste: your-super-secret-key-here-make-it-long-and-random

# Add NEXTAUTH_URL
vercel env add NEXTAUTH_URL
# Paste: https://your-vercel-domain.vercel.app
```

---

## Option 2: Railway (Alternative - Free Tier Available)

### Step 1: Create a Railway Account
1. Go to [https://railway.app](https://railway.app)
2. Sign up with GitHub

### Step 2: Create a MySQL Database
1. Click "New Project"
2. Select "Provision MySQL"
3. Wait for the database to be created

### Step 3: Get Connection String
1. Click on the MySQL service
2. Go to "Variables" tab
3. Copy the `DATABASE_URL` value

### Step 4: Add to Vercel
Same as PlanetScale Step 4 above.

---

## Option 3: Aiven (Alternative - Free Tier Available)

### Step 1: Create an Aiven Account
1. Go to [https://aiven.io](https://aiven.io)
2. Sign up for free

### Step 2: Create a MySQL Service
1. Click "Create Service"
2. Select "MySQL"
3. Choose the free tier
4. Select a region

### Step 3: Get Connection String
1. Go to your service overview
2. Copy the connection details
3. Format as: `mysql://user:password@host:port/database`

---

## After Setting Up Database

### Step 1: Deploy to Vercel
```bash
cd chockys-glamour
vercel --prod
```

### Step 2: Run Prisma Migrations
After deployment, you need to push the database schema:

```bash
# Pull environment variables locally
vercel env pull .env.local

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 3: Seed the Database (Optional)
```bash
npx prisma db seed
```

---

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@host:3306/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | `your-random-secret-key` |
| `NEXTAUTH_URL` | Your deployed URL | `https://chockys-glamour.vercel.app` |

---

## Troubleshooting

### Error: Can't reach database server
- Check if your DATABASE_URL is correct
- Ensure the database is running
- Check if SSL is required (add `?sslaccept=strict` for PlanetScale)

### Error: Prisma Client not generated
Run: `npx prisma generate`

### Error: Schema not in sync
Run: `npx prisma db push`

---

## Quick Commands Reference

```bash
# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Deploy to production
vercel --prod

# Check deployment status
vercel ls
