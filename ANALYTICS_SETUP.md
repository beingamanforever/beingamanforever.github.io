# Visitor Analytics Setup Guide

## 🚀 Quick Start (5 minutes)

### 1. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click "New Project"
3. Create a project (remember your password!)
4. Once created, go to the **SQL Editor**
5. Copy and paste the contents of `supabase-setup.sql`
6. Click "Run" to create the database schema

### 2. Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these two values:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `anon public` key (long string starting with `eyJ...`)

### 3. Deploy API to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. From your project directory:
   ```bash
   cd /Users/aman/systems/amanbehera.github.io
   npm install
   vercel login
   vercel
   ```

3. Follow the prompts:
   - Link to existing project? **No**
   - Project name? **visitor-analytics** (or whatever you want)
   - Directory? Just press Enter

4. Add environment variables:
   ```bash
   vercel env add SUPABASE_URL
   # Paste your Supabase Project URL

   vercel env add SUPABASE_ANON_KEY
   # Paste your Supabase anon key
   ```

5. Deploy to production:
   ```bash
   vercel --prod
   ```

6. Copy your Vercel URL (e.g., `https://your-project.vercel.app`)

### 4. Update Your Website

1. Edit `js/analytics.js` line 7:
   ```javascript
   const API_ENDPOINT = 'https://your-project.vercel.app/api/track';
   ```
   Replace with your actual Vercel URL

2. Edit `dashboard.html` lines 218-219:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```
   Replace with your Supabase credentials

### 5. Create Dashboard User

1. Go to Supabase **Authentication** → **Users**
2. Click "Add User"
3. Enter email and password (this is your dashboard login)
4. Save it!

### 6. Test Everything

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Add visitor analytics"
   git push
   ```

2. Visit your site - tracking should work automatically
3. Go to `your-site.com/dashboard.html`
4. Sign in with the email/password you created
5. See your visitors! 🎉

## 📊 What You Get

- **Real-time tracking**: Every page view is logged
- **Location data**: Country and city from IP (privacy-friendly, IP is hashed)
- **Device info**: Desktop/Mobile/Tablet, browser, OS
- **Session tracking**: Unique visitors vs total visits
- **Privacy-first**: No cookies, no tracking across sites, IP addresses are hashed

## 🔒 Security Notes

- Only you can view the dashboard (requires login)
- Visitor IPs are hashed - not stored in plain text
- All data stays in your Supabase database
- No third-party tracking companies

## 💰 Cost

- **Supabase**: Free tier (500MB database, 50K monthly active users)
- **Vercel**: Free tier (100GB bandwidth, unlimited API requests)
- **ipapi.co**: Free tier (1000 requests/day for geolocation)

Total cost: **$0/month** 🎉

## 🛠 Troubleshooting

**Tracking not working?**
- Check browser console for errors
- Verify `API_ENDPOINT` in `analytics.js` matches your Vercel URL
- Check Vercel logs: `vercel logs`

**Dashboard login fails?**
- Make sure you created a user in Supabase Authentication
- Check Supabase credentials in `dashboard.html`

**No location data?**
- Free IP geolocation has limits (1000/day)
- Tracking will still work, just missing city/country

## 📈 Future Enhancements

- Add charts/graphs with Chart.js
- Add visitor map with Leaflet.js
- Export data to CSV
- Email notifications for milestones
- Custom events tracking

## 🔥 Alternative: Railway instead of Vercel

If you prefer Railway:
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Deploy

Same setup, different platform!
