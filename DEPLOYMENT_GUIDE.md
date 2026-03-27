# NaqlFlow — aaPanel Deployment Guide

> Deploy NaqlFlow (Next.js 16 + Supabase) on a Linux VPS via aaPanel.

---

## Prerequisites

| Item | Requirement |
|------|-------------|
| VPS | Ubuntu 22.04+ or CentOS 8+ |
| aaPanel | v8.x installed |
| Node.js | v20+ (install via aaPanel → App Store → Node.js) |
| RAM | Minimum 1 GB |
| Domain | e.g. `naqlflow.yourdomain.com` |
| Supabase | Project URL + Keys ready |

---

## Step 1: Upload Project to Server

### Option A — Git Clone (Recommended)
```bash
cd /www/wwwroot
git clone https://github.com/drjimmy1990/naqlflow.git naqlflow
cd naqlflow
```

### Option B — Upload ZIP
1. ZIP the project folder (exclude `node_modules` and `.next`)
2. aaPanel → Files → Navigate to `/www/wwwroot/`
3. Upload ZIP → Extract

---

## Step 2: Install Dependencies & Build

```bash
cd /www/wwwroot/naqlflow
npm install
```

### Create `.env.local`
```bash
nano .env.local
```

Paste your environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Port (change this to use a different port)
PORT=3099

# n8n Webhooks (optional — set when n8n is ready)
N8N_WEBHOOK_WHATSAPP_ORDER=https://n8n.yourdomain.com/webhook/naqlflow-whatsapp-order
N8N_WEBHOOK_FINANCIAL_CHECK=https://n8n.yourdomain.com/webhook/naqlflow-financial-check
N8N_WEBHOOK_OTP_DISPATCH=https://n8n.yourdomain.com/webhook/naqlflow-otp-dispatch
N8N_WEBHOOK_VOICE_COLLECTION=https://n8n.yourdomain.com/webhook/naqlflow-voice-collection
N8N_WEBHOOK_EXPIRY_ALERTS=https://n8n.yourdomain.com/webhook/naqlflow-expiry-alerts
N8N_WEBHOOK_ORDER_CLOSED=https://n8n.yourdomain.com/webhook/naqlflow-order-closed
```

### Build for Production
```bash
npm run build
```

> ⚠️ This generates the `.next` folder. The build takes 1-3 minutes depending on server specs.

---

## Step 3: Configure aaPanel Node Project

1. Open aaPanel → **Website** → **Node Project** tab
2. Click **"Add Node project"**
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Path** | `/www/wwwroot/naqlflow` |
| **Name** | `naqlflow` |
| **Run opt** | Select: `Custom Command` |
| **Port** | `3099` |
| **User** | `www` |
| **Node** | `v20.x` or `v22.x` (whichever you installed) |
| **Domain name** | `naqlflow.yourdomain.com` |

4. For **Custom Command**, enter:
```
npm run start
```

5. Click **Confirm**

> ✅ aaPanel will start the Next.js production server on port 3099.

---

## Step 4: Configure Nginx Reverse Proxy

aaPanel auto-creates an Nginx config when you add the node project. But verify it is correct:

1. Go to **Website** → click **Settings** on your node project
2. Click **Config** (Nginx configuration)
3. Make sure the `location /` block looks like this:

```nginx
location / {
    proxy_pass http://127.0.0.1:3099;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_read_timeout 300s;
    proxy_send_timeout 300s;
}
```

4. Save and restart Nginx.

---

## Step 5: Enable SSL (HTTPS)

1. Go to **Website** → click **Settings** on your project
2. Click **SSL** tab
3. Select **Let's Encrypt** → enter your domain → click **Apply**
4. Enable **Force HTTPS**

---

## Step 6: Verify Everything Works

```bash
# Check the process is running
curl http://127.0.0.1:3099
```

Visit `https://naqlflow.yourdomain.com` — you should see the NaqlFlow dashboard.

---

## Updating the App

When you push new code:

```bash
cd /www/wwwroot/naqlflow

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Rebuild
npm run build

# Restart the node project
# Option A: via aaPanel UI → Node Project → click "Restart"
# Option B: via terminal
pm2 restart naqlflow
```

---

## Troubleshooting

### Build fails with "out of memory"
```bash
# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### Port 3099 already in use
```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### App not loading after restart
```bash
# Check process logs
pm2 logs naqlflow --lines 50

# Or check aaPanel logs
cat /www/wwwroot/naqlflow/.pm2/logs/naqlflow-error.log
```

### Static files not loading (CSS/JS 404)
Make sure Nginx proxy passes all routes, not just `/`. The config above handles this.

### Environment variables not working
- `.env.local` must be in the project root (`/www/wwwroot/naqlflow/.env.local`)
- `NEXT_PUBLIC_*` vars are baked at build time → **rebuild after changing them**
- Server-only vars (without `NEXT_PUBLIC_`) can be changed and just restart

---

## Quick Reference

| Action | Command |
|--------|---------|
| Start | `npm run start` or `pm2 start naqlflow` |
| Stop | `pm2 stop naqlflow` |
| Restart | `pm2 restart naqlflow` |
| Logs | `pm2 logs naqlflow` |
| Rebuild | `npm run build` |
| Check status | `pm2 status` |

---

## File Structure on Server

```
/www/wwwroot/naqlflow/
├── .env.local          ← Your secrets (not in git)
├── .next/              ← Production build output
├── node_modules/       ← Dependencies
├── package.json        ← Scripts & deps
├── public/             ← Static assets
├── src/                ← Source code
│   ├── app/            ← Pages (orders, drivers, etc.)
│   ├── components/     ← Shared components
│   └── lib/            ← Supabase client & types
└── next.config.ts      ← Next.js config
```
