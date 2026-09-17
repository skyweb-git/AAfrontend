# Vercel Deployment Guide - Fixing Image Loading Issues

## Problem Summary
Images were loading intermittently because:
1. Frontend was using hardcoded local API URLs in production (now: `https://sverx.nanoprofiles.com`)
2. API URL was not properly configured via environment variables
3. Caching issues on Vercel were causing stale responses

## Changes Made

### 1. Fixed API Configuration (src/config.js, src/services/api.js)
- Environment variable `REACT_APP_API_URL` now takes priority
- Added proper fallback chain: Env Var → Local Dev → Default
- Added cache-busting headers to prevent stale responses

### 2. Fixed Hero Component (src/components/Hero.jsx)
- Now uses centralized `API_URL` from config
- Added cache-busting parameter for Cloudinary images
- Better error handling with console logging

### 3. Fixed Chatbot Component (src/components/Chatbot.jsx)
- Now uses centralized `API_URL` from config
- Added no-cache headers

### 4. Updated Server CORS/Vercel Config (server/vercel.json)
- Added no-cache headers to all responses
- Added catch-all route handler

## Required Vercel Configuration

### Frontend Project (Root folder)

1. **Set Environment Variable in Vercel Dashboard:**
   ```
   Name: REACT_APP_API_URL
   Value: https://your-backend.vercel.app
   ```
   (Replace with your actual backend URL)

2. **Build Settings:**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

### Backend Project (server folder)

1. **Set Environment Variables in Vercel Dashboard:**
   ```
   MONGODB_URI=your_mongodb_uri
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   JWT_SECRET=your_jwt_secret
   (and other required env vars from server/.env)
   ```

2. **Build Settings:**
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Install Command: `npm install`

## How to Redeploy

### Option 1: Redeploy Frontend Only
```bash
# From root folder
vercel --prod
```

### Option 2: Redeploy Backend Only
```bash
# From server folder
cd server
vercel --prod
```

### Option 3: Redeploy Both
```bash
# Deploy backend first
cd server && vercel --prod && cd ..

# Then deploy frontend
vercel --prod
```

## Verification Steps

1. Check browser console for API_URL:
   ```javascript
   console.log(window.location.hostname);
   // Should show your backend URL, not localhost
   ```

2. Check Network tab in DevTools:
   - API calls should go to `https://your-backend.vercel.app/api/...`
   - Not `https://sverx.nanoprofiles.com/api/...`

3. Check Response Headers:
   - Should see `Cache-Control: no-store, no-cache`

## Common Issues & Solutions

### Issue: Images still not loading after redeploy
**Solution:** Clear browser cache and hard reload (Ctrl+Shift+R)

### Issue: CORS errors in console
**Solution:** Check that backend CORS allows your frontend domain in `server/vercel.json`

### Issue: API returns 404
**Solution:** Verify `REACT_APP_API_URL` is set correctly in Vercel dashboard

### Issue: Environment variables not working
**Solution:** 
- Must use `REACT_APP_` prefix for frontend env vars (Create React App requirement)
- Redeploy after adding env vars (they don't auto-apply)
- Check that env vars are set in Production, not just Preview

## Testing Locally Before Deploy

```bash
# Test with production API locally
REACT_APP_API_URL=https://your-backend.vercel.app npm start
```

This will help verify everything works before deploying.
