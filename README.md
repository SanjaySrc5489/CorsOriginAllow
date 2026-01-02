# CORS Proxy Server

A simple, fast, and reliable CORS proxy server to bypass CORS restrictions.

## 🚀 Quick Start

### Run Locally

```bash
cd cors-proxy-server
npm install
npm start
```

Server runs at: `http://localhost:8080`

### Test It

```bash
curl "http://localhost:8080/proxy?url=https://m.vegamovies.cricket/?s=tt10799690"
```

## 📦 Deploy to Railway (2 Minutes)

### Option 1: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd cors-proxy-server
railway init
railway up
```

You'll get a URL like: `https://your-proxy.railway.app`

### Option 2: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub account
4. Push `cors-proxy-server` folder to GitHub
5. Select the repo
6. Railway auto-deploys!

## 📦 Deploy to Render (Free)

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repo
4. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"

Free tier: `https://your-proxy.onrender.com`

## 📦 Deploy to Vercel

```bash
cd cors-proxy-server
vercel
```

Follow prompts, get URL: `https://your-proxy.vercel.app`

## 📦 Deploy to Heroku

```bash
cd cors-proxy-server
heroku create your-cors-proxy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

URL: `https://your-cors-proxy.herokuapp.com`

---

## 🔧 Usage in Your Flutter App

Once deployed, update `cors_config.dart`:

```dart
static const List<String> proxyServers = [
  'https://your-proxy.railway.app/proxy?url=',  // Your custom proxy!
  'https://corsproxy.io/?',  // Backup
];
```

## 🧪 API Endpoints

### GET /
Health check

**Response:**
```json
{
  "status": "ok",
  "message": "CORS Proxy Server is running"
}
```

### GET /proxy?url=YOUR_URL
Proxy any GET request

**Example:**
```
GET /proxy?url=https://m.vegamovies.cricket/?s=tt10799690
```

### POST /proxy
Proxy POST requests

**Body:**
```json
{
  "url": "https://example.com/api",
  "data": { "key": "value" },
  "headers": { "Authorization": "Bearer token" }
}
```

## 🏃 For Development: Disable Web Security

Add this to your Flutter run command:

```bash
flutter run -d chrome --web-browser-flag "--disable-web-security"
```

**Or create a launch configuration:**

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flutter Web (No CORS)",
      "request": "launch",
      "type": "dart",
      "args": [
        "--web-browser-flag",
        "--disable-web-security"
      ]
    }
  ]
}
```

Then run from VS Code: `F5` → Select "Flutter Web (No CORS)"

⚠️ **Only for development! Never use this in production.**

## 📊 Features

✅ Fast & lightweight  
✅ Handles GET and POST requests  
✅ Proper user-agent headers  
✅ 30-second timeout  
✅ Error handling  
✅ CORS headers for all origins  
✅ Health check endpoint  
✅ Logging for debugging  

## 🔒 Security Notes

- This proxy allows requests from ANY origin (⚠️ security consideration)
- For production, add authentication or restrict origins
- Monitor usage to prevent abuse

## 💰 Cost

- **Railway**: Free tier (500 hours/month)
- **Render**: Free tier (750 hours/month)
- **Vercel**: Free tier (100GB bandwidth/month)
- **Heroku**: Free tier (550-1000 dyno hours/month)

Pick any - they're all free for your use case!

## 🎯 Recommended

**Best for your needs**: **Railway**
- Easiest deployment
- Good free tier
- Fast
- Reliable

Just run: `railway init` → `railway up` → Done!
