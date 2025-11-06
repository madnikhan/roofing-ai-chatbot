# Deployment Guide for Vercel

This guide will help you deploy your Roofing AI Chatbot to Vercel.

## Prerequisites

1. A GitHub account (or GitLab/Bitbucket)
2. A Vercel account (free tier works fine)
3. Your code pushed to a Git repository

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Your Code to GitHub

1. **Create a new repository on GitHub** (if you haven't already)
   ```bash
   # Initialize git (if not already done)
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit: Roofing AI Chatbot"
   
   # Add your GitHub repository as remote
   git remote add origin https://github.com/yourusername/roofing-ai-chatbot.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
   - Sign up or log in with your GitHub account

2. **Click "Add New Project"**
   - Click "Import Git Repository"
   - Select your repository
   - Click "Import"

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Environment Variables** (if needed)
   - Add `NEXT_PUBLIC_BASE_URL` if you want to customize the base URL
   - Format: `https://your-domain.vercel.app`
   - Otherwise, Vercel will auto-generate this

5. **Click "Deploy"**
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod
```

### Step 4: Set Environment Variables (if needed)

```bash
vercel env add NEXT_PUBLIC_BASE_URL
# Enter your production URL when prompted
```

## Post-Deployment Setup

### 1. Update BASE_URL in layout.tsx (if needed)

If you set a custom domain, update `metadataBase` in `app/layout.tsx`:

```typescript
metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.vercel.app'),
```

### 2. Test Your Deployment

- ✅ Visit your deployed URL
- ✅ Test the chat widget
- ✅ Test the contact form
- ✅ Test the admin dashboard
- ✅ Verify all pages load correctly

### 3. Set Up Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Important Notes

### Data Storage

⚠️ **Important**: The `/data` folder is gitignored and uses JSON files for storage. 

- **Local development**: Data is stored in `/data` folder
- **Vercel deployment**: Each deployment has its own filesystem, so data won't persist between deployments
- **For production**: Consider migrating to a database (PostgreSQL, MongoDB, etc.) or use Vercel KV for persistent storage

### Environment Variables

Currently, the app uses:
- `NEXT_PUBLIC_BASE_URL` (optional) - For metadata and SEO

### File Structure

The following are ignored by git (as per `.gitignore`):
- `/node_modules` - Dependencies
- `/.next` - Build output
- `/data` - Lead storage (local JSON files)
- `.env*.local` - Local environment variables

## Troubleshooting

### Build Fails

1. **Check Node.js version**: Vercel uses Node.js 18.x by default (you can specify in `package.json`)
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **Check build logs**: Go to your Vercel project → Deployments → Click on failed deployment → Check logs

3. **Common issues**:
   - Missing dependencies → Check `package.json`
   - TypeScript errors → Run `npm run build` locally first
   - Missing environment variables → Add them in Vercel dashboard

### Preview Deployments

Every push to your repository creates a preview deployment. This is great for testing before merging to main.

### Automatic Deployments

- **Production**: Automatically deploys when you push to `main` branch
- **Preview**: Automatically deploys for all other branches and pull requests

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all functionality
3. 🔄 Set up database for persistent lead storage (optional)
4. 🔄 Configure custom domain (optional)
5. 🔄 Set up analytics (optional)
6. 🔄 Configure email service for contact form (optional)

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

