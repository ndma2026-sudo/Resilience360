# Resilience360 Deployment Setup Guide

## Overview
This repository contains multiple applications:
1. **Retrofit Calculator** - Frontend app (deployed to GitHub Pages)
2. **Backend Server** - Node.js API (deployed to Render.io)
3. **Other Portals** - Additional web applications

## Frontend Deployment (GitHub Pages)
✅ **Status**: Automatic deployment on push to `main` branch

Access the Retrofit Calculator at:
https://shanu222.github.io/Resilience360/retrofit-calculator/

## Backend Deployment (Render.io)

### Required Environment Variables
Set these in your Render.io dashboard for the `resilience360-backend` service:

```
OPENAI_API_KEY          # Your OpenAI API key (for vision analysis)
RESEND_API_KEY          # Resend email API key (optional)
BREVO_API_KEY           # Brevo email API key (optional)
HUGGINGFACE_API_KEY     # Hugging Face API key (optional, alternative to OpenAI)
RECOVERY_EMAIL_PROVIDER # 'resend' or 'brevo'
RECOVERY_FROM_EMAIL     # Email address for recovery notifications
RECOVERY_FROM_NAME      # Name to show in recovery emails
MATERIAL_HUBS_SUPABASE_URL      # Supabase URL
MATERIAL_HUBS_SUPABASE_ANON_KEY # Supabase anonymous key
MATERIAL_HUBS_ADMIN_EMAILS      # Comma-separated admin emails
```

### Troubleshooting Backend Deployment

**Issue**: Deployment fails or server won't start
**Solution**: 
1. Check environment variables are set in Render.io dashboard
2. View deployment logs in Render.io console
3. Ensure at least OPENAI_API_KEY or HUGGINGFACE_API_KEY is set

**Note**: Without API keys, the server will start but vision analysis won't work

## Local Development

### Start Backend
```bash
npm install
npm run server
```
Server runs on `http://localhost:8787`

### Start Frontend Dev Server (for Retrofit Calculator)
```bash
cd "Retrofit Calculator"
npm install
npm run dev
```

### Build Frontend
```bash
cd "Retrofit Calculator"
npm run build
```
Output files are in `dist/` - copy to `public/retrofit-calculator/` for GitHub Pages deployment

## API Endpoints

### Health Check
```
GET /health
```
Returns `200 OK` if server is running

### Vision Analysis (Retrofit Calculator)
```
POST /analyze-building-image
Content-Type: multipart/form-data

Parameters:
- image: File (required) - JPEG/PNG image of building
- location?: string - Province/City for cost estimation
- scope?: string - 'basic' | 'standard' | 'comprehensive'
```

Returns analysis with detected defects and cost estimates

## Deployment Workflow

1. **Make Changes**: Commit to `main` branch
2. **Push**: `git push origin main`
3. **Automatic Deployment**:
   - GitHub Pages: ≈ 1-2 minutes for frontend
   - Render.io: ≈ 5-10 minutes for backend
4. **Verify**:
   - Frontend: Visit the GitHub Pages link
   - Backend: Check `/health` endpoint

## Current Deployment Status

- ✅ Frontend: Deployed to GitHub Pages
- ⏳ Backend: Deploying to Render.io (watch logs for completion)
- 🔧 Configuration: Set all required env vars in Render.io dashboard

## Next Steps

1. Set environment variables in Render.io dashboard
2. Wait for backend deployment to complete
3. Test the Retrofit Calculator at GitHub Pages
4. Monitor logs for any runtime errors
