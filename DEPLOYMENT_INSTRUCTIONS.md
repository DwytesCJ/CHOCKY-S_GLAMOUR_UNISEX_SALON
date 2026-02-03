# Manual Deployment Instructions

## 1. Configure Environment Variables

1. Open the `.env` file in the `chockys-glamour` directory.
2. Replace the placeholders with your actual values:
   - `DATABASE_URL`: Your MySQL connection string (from PlanetScale, Railway, or Aiven).
   - `NEXTAUTH_SECRET`: A random string for authentication security.
   - `NEXTAUTH_URL`: Your deployed URL (e.g., `https://your-project.vercel.app`) or `http://localhost:3000` for local testing.

## 2. Deploy to Vercel

1. Open a terminal in the `chockys-glamour` directory.
2. Run the following command to deploy:
   ```bash
   vercel deploy --prod
   ```
3. Follow the prompts:
   - Set up and deploy? **yes**
   - Which scope? **(Select your account)**
   - Link to existing project? **no**
   - Project name? **(Enter a unique name, e.g., chockys-salon-v1)**
   - In which directory is your code located? **./**
   - Want to modify these settings? **no**

## 3. Post-Deployment Setup

1. Once deployed, go to the Vercel dashboard for your project.
2. Navigate to **Settings > Environment Variables**.
3. Add the same variables from your `.env` file to the Vercel project settings.
4. Redeploy if necessary to apply the environment variables.

## 4. Database Migration

After configuring the database URL, run the following command locally to push the schema to your database:

```bash
npx prisma db push
