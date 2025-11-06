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

**Option A: Vercel KV (Automatic)**
Vercel automatically adds these environment variables when you create KV:
- `KV_REST_API_URL` - Your KV REST API URL
- `KV_REST_API_TOKEN` - Your KV REST API token
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token (optional)

**Option B: Redis Cloud / Other Redis (Manual)**
If you're using Redis Cloud or another Redis service, add:
- `REDIS_URL` - Your Redis connection string
  - Format: `redis://default:password@host:port`
  - Example: `redis://default:password@redis-16256.c14.us-east-1-3.ec2.redns.redis-cloud.com:16256`

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

1. **Check Redis is configured**: 
   - For Vercel KV: Go to Storage tab in Vercel dashboard
   - For Redis Cloud: Check your Redis Cloud dashboard
2. **Check environment variables**: 
   - Vercel KV: `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   - Redis Cloud: `REDIS_URL` (connection string)
3. **Check function logs**: Go to Deployments → Click on latest deployment → View function logs
   - Look for: `[API] Redis URL: Set` or `Not set`
   - Look for: `Redis Client Connected` or error messages
4. **Redeploy**: Sometimes a redeploy is needed after adding Redis variables

### Error: Cannot find module '@vercel/kv'

Make sure:
1. `@vercel/kv` is in `package.json` dependencies
2. You've run `npm install` (or Vercel auto-installs)
3. Redeploy after adding the dependency

## Cost

- **Vercel KV**: Free tier includes 256 MB storage
- For most use cases, this is more than enough
- See https://vercel.com/pricing for details

