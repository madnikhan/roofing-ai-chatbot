# Vercel KV Setup Guide

This application uses Vercel KV (Redis) for persistent data storage on Vercel. File-based storage doesn't work on Vercel's serverless functions because they're stateless.

## Quick Setup

### Step 1: Install Vercel KV in Your Vercel Project

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database**
5. Select **KV** (Redis)
6. Click **Create**
7. This will automatically add the required environment variables

### Step 2: Verify Environment Variables

Vercel automatically adds these environment variables when you create KV:
- `KV_REST_API_URL` - Your KV REST API URL
- `KV_REST_API_TOKEN` - Your KV REST API token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token (optional)

These are automatically available to your serverless functions.

### Step 3: Redeploy

After creating the KV database:
1. Vercel will automatically redeploy your project
2. Or manually trigger a redeploy from the **Deployments** tab

That's it! Your leads will now persist in Vercel KV.

## Local Development

For local development, the code will fall back to file-based storage (`/data/leads.json`). This works fine for testing locally.

## Alternative: MongoDB Atlas (Free)

If you prefer MongoDB:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string
4. Add it as `MONGODB_URI` environment variable in Vercel
5. Update `lib/database.ts` to use MongoDB instead

## Alternative: Supabase (Free PostgreSQL)

If you prefer PostgreSQL:

1. Go to https://supabase.com
2. Create a free project
3. Get your connection string
4. Add it as `DATABASE_URL` environment variable in Vercel
5. Update `lib/database.ts` to use Supabase/PostgreSQL

## Troubleshooting

### Leads Still Not Showing?

1. **Check Vercel KV is created**: Go to Storage tab in Vercel dashboard
2. **Check environment variables**: Make sure `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
3. **Check function logs**: Go to Deployments → Click on latest deployment → View function logs
4. **Redeploy**: Sometimes a redeploy is needed after adding KV

### Error: Cannot find module '@vercel/kv'

Make sure:
1. `@vercel/kv` is in `package.json` dependencies
2. You've run `npm install` (or Vercel auto-installs)
3. Redeploy after adding the dependency

## Cost

- **Vercel KV**: Free tier includes 256 MB storage
- For most use cases, this is more than enough
- See https://vercel.com/pricing for details

