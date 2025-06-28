# Vercel Deployment Guide

## Prerequisites

1. Vercel account
2. GitHub repository
3. Vercel CLI (optional)

## Initial Setup

### 1. Connect to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the monorepo root directory
5. Override the following settings:
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=web`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### 2. Environment Variables

Set the following environment variables in Vercel Dashboard:

```
NEXT_PUBLIC_API_URL=https://api.sensilog.com
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 3. GitHub Actions Setup

Add the following secrets to your GitHub repository:

1. **VERCEL_ORG_ID**: Found in Vercel Dashboard → Settings → General
2. **VERCEL_PROJECT_ID**: Found in Vercel Dashboard → Settings → General
3. **VERCEL_TOKEN**: Create at [vercel.com/account/tokens](https://vercel.com/account/tokens)

## Deployment Workflow

### Automatic Deployment
- **Production**: Push to `main` branch
- **Preview**: Create a pull request

### Manual Deployment
```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

## Build Configuration

The project uses the following configuration:

### `apps/web/vercel.json`
```json
{
  "buildCommand": "cd ../.. && pnpm install --frozen-lockfile && pnpm build --filter=web",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

### GitHub Actions Workflow
- Located at `.github/workflows/deploy-web.yml`
- Triggers on:
  - Push to main branch
  - Pull requests
  - Changes to web app or packages

## Troubleshooting

### Build Failures
1. Check Node.js version (should be 20.x)
2. Ensure pnpm version matches (8.x)
3. Verify environment variables are set

### Module Resolution Issues
1. Clear Vercel cache: Settings → Advanced → Clear Cache
2. Check `package.json` dependencies
3. Verify workspace dependencies

### Environment Variables
1. Ensure all `NEXT_PUBLIC_*` variables are set
2. Redeploy after changing environment variables
3. Use `.env.example` as reference

## Performance Optimization

1. **Enable Turbo**: Already configured with `--turbopack`
2. **Image Optimization**: Using Next.js Image component
3. **Edge Functions**: Consider for API routes
4. **Analytics**: Vercel Analytics integration available

## Monitoring

1. **Build Logs**: Available in Vercel Dashboard
2. **Function Logs**: Real-time logs for API routes
3. **Analytics**: Page views and Web Vitals
4. **Speed Insights**: Performance metrics

## Costs

- **Hobby Plan**: Free, sufficient for development
- **Pro Plan**: $20/month, required for commercial use
- **Usage-based**: Additional costs for bandwidth/functions