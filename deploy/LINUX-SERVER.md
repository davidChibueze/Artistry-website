# Self-Hosting on a Linux Server (Non-Vercel)

This guide deploys both `artist-admin` (Payload CMS) and `artistry` (Next.js frontend)
on a single Linux VPS using **PM2** as a process manager and **Nginx** as a reverse proxy.

```
Internet
   │
  Nginx (port 80 / 443)
   ├─► admin.poshbugati.com  →  artist-admin  (port 3000)
   └─► poshbugati.com        →  artistry      (port 3001)
```

Tested on **Ubuntu 22.04 / 24.04**. Commands are the same on Debian 12.

---

## 1. Provision the Server

Minimum recommended spec:
- **2 vCPU, 2 GB RAM** (4 GB preferred — Next.js builds are memory-hungry)
- **20 GB SSD**
- Ubuntu 22.04 LTS

Open these firewall ports before you start:

```bash
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw enable
```

---

## 2. Install System Dependencies

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install essentials
sudo apt install -y git curl wget build-essential

# Install Node.js 20 (LTS) via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v   # should be v20.x.x
npm -v

# Install pnpm (the package manager this project uses)
npm install -g pnpm

# Install PM2 (process manager — keeps apps running, auto-restarts on crash)
npm install -g pm2

# Install Nginx (reverse proxy + SSL termination)
sudo apt install -y nginx

# Install Certbot for free SSL from Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
```

---

## 3. Create a Dedicated App User (Recommended)

Running apps as root is a security risk. Create a separate user:

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to the deploy user for everything below
su - deploy
```

---

## 4. Clone the Repository

```bash
cd ~
git clone https://github.com/davidChibueze/Artistry-website.git
cd Artistry-website
```

---

## 5. Configure Environment Variables

### Backend — `artist-admin`

```bash
cd ~/Artistry-website/artist-admin
cp .env.example .env
nano .env
```

Fill in every value (refer to `deploy/DEPLOYMENT.md` Part 1.3 for descriptions):

```env
PAYLOAD_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_SERVER_URL=https://admin.poshbugati.com
FRONTEND_URL=https://poshbugati.com

DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

S3_BUCKET=your-supabase-project-id
S3_REGION=auto
S3_ENDPOINT=https://[project-id].supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=your-service-role-key
S3_SECRET_ACCESS_KEY=your-service-role-key

RESEND_API_KEY=re_xxxxxxxxxxxx

CREDO_PUBLIC_KEY=pk_live_xxxxx
CREDO_SECRET_KEY=sk_live_xxxxx
CREDO_BASE_URL=https://api.credocentral.com

CRON_SECRET=<openssl rand -base64 32>
PREVIEW_SECRET=<openssl rand -base64 32>

SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
LOG_LEVEL=info
```

### Frontend — `artistry`

```bash
cd ~/Artistry-website/artistry
cp .env.example .env.local 2>/dev/null || touch .env.local
nano .env.local
```

```env
NEXT_PUBLIC_API_URL=https://admin.poshbugati.com/api
NEXT_PUBLIC_SITE_URL=https://poshbugati.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-live-client-id
```

---

## 6. Install Dependencies and Build Both Apps

### Backend

```bash
cd ~/Artistry-website/artist-admin
pnpm install --frozen-lockfile
pnpm build
```

### Frontend

```bash
cd ~/Artistry-website/artistry
pnpm install --frozen-lockfile
pnpm build
```

> Both builds will take 2–5 minutes. If the build runs out of memory, add
> `NODE_OPTIONS=--max-old-space-size=1536` before the build command.

---

## 7. Run Both Apps with PM2

PM2 keeps the Node processes alive, restarts them on crash, and starts them
automatically when the server reboots.

```bash
# Start the backend on port 3000
cd ~/Artistry-website/artist-admin
pm2 start "pnpm start" --name artist-admin --cwd ~/Artistry-website/artist-admin

# Start the frontend on port 3001
cd ~/Artistry-website/artistry
PORT=3001 pm2 start "pnpm start" --name artistry --cwd ~/Artistry-website/artistry

# Save the process list so PM2 restores it after a server reboot
pm2 save

# Register PM2 as a systemd service so it starts on boot
pm2 startup systemd -u deploy --hp /home/deploy
# — PM2 prints a command starting with "sudo env PATH=...". Run that command.
```

Verify both are running:

```bash
pm2 status
```

You should see two processes with status `online`.

```
┌─────────────────┬────┬──────┬───────┬────────┐
│ name            │ id │ mode │ pid   │ status │
├─────────────────┼────┼──────┼───────┼────────┤
│ artist-admin    │ 0  │ fork │ 12345 │ online │
│ artistry        │ 1  │ fork │ 12346 │ online │
└─────────────────┴────┴──────┴───────┴────────┘
```

---

## 8. Configure Nginx

Create two Nginx server blocks — one per app.

### 8.1 Backend config

```bash
sudo nano /etc/nginx/sites-available/artist-admin
```

```nginx
server {
    listen 80;
    server_name admin.poshbugati.com;

    # Increase body size limit for media uploads
    client_max_body_size 100M;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }
}
```

### 8.2 Frontend config

```bash
sudo nano /etc/nginx/sites-available/artistry
```

```nginx
server {
    listen 80;
    server_name poshbugati.com www.poshbugati.com;

    client_max_body_size 10M;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 8.3 Enable both sites

```bash
sudo ln -s /etc/nginx/sites-available/artist-admin /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/artistry     /etc/nginx/sites-enabled/

# Test the config for syntax errors
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 9. Point Your Domains to the Server

In your DNS provider (Cloudflare, Namecheap, etc.), add:

| Type | Name | Value |
|---|---|---|
| A | `poshbugati.com` | `<your-server-IP>` |
| A | `www` | `<your-server-IP>` |
| A | `admin` | `<your-server-IP>` |

DNS propagation can take up to 30 minutes.

---

## 10. Enable SSL with Let's Encrypt

Once DNS has propagated, run Certbot:

```bash
# Frontend domain + www
sudo certbot --nginx -d poshbugati.com -d www.poshbugati.com

# Admin domain
sudo certbot --nginx -d admin.poshbugati.com
```

Certbot will:
1. Verify domain ownership via HTTP challenge
2. Obtain a free TLS certificate
3. Automatically rewrite your Nginx config to redirect HTTP → HTTPS

Certificates renew automatically. Test auto-renewal:

```bash
sudo certbot renew --dry-run
```

---

## 11. Run Database Migrations

If you are using Supabase as your database, migrations must be applied
before the admin will work correctly.

```bash
cd ~/Artistry-website/artist-admin

# Option A — Payload migration runner (may fail if payload_migrations is out of sync)
pnpm payload migrate

# Option B — Apply SQL directly (safer for this project)
node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => {
  // paste your ALTER TABLE SQL here
  return c.query('SELECT 1');
}).then(() => c.end());
"
```

See `deploy/DEPLOYMENT.md` Part 1.5 for the full migration procedure.

---

## 12. Updating the Application

Every time you push new code, SSH into the server and run:

```bash
cd ~/Artistry-website

# Pull latest code
git pull origin main

# Rebuild backend
cd artist-admin
pnpm install --frozen-lockfile
pnpm build
pm2 restart artist-admin

# Rebuild frontend
cd ../artistry
pnpm install --frozen-lockfile
pnpm build
pm2 restart artistry
```

Or use the helper script below.

---

## 13. Deploy Script (Optional Shortcut)

Save this as `~/deploy.sh` on the server:

```bash
#!/bin/bash
set -e

REPO=~/Artistry-website

echo "==> Pulling latest code..."
cd $REPO && git pull origin main

echo "==> Building artist-admin..."
cd $REPO/artist-admin
pnpm install --frozen-lockfile
pnpm build
pm2 restart artist-admin

echo "==> Building artistry..."
cd $REPO/artistry
pnpm install --frozen-lockfile
pnpm build
pm2 restart artistry

echo "==> Done. PM2 status:"
pm2 status
```

```bash
chmod +x ~/deploy.sh
# To deploy: just run:
~/deploy.sh
```

---

## 14. Useful Commands

```bash
# View live logs for both apps
pm2 logs

# View logs for one app only
pm2 logs artist-admin
pm2 logs artistry

# Restart an app
pm2 restart artist-admin
pm2 restart artistry

# Restart both
pm2 restart all

# Stop an app
pm2 stop artist-admin

# Check memory / CPU usage
pm2 monit

# Reload Nginx after config changes
sudo systemctl reload nginx

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check SSL cert expiry
sudo certbot certificates
```

---

## 15. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `502 Bad Gateway` from Nginx | App not running | `pm2 status` — restart if stopped |
| App crashes on start | Missing env var | `pm2 logs artist-admin` — read the error |
| Build runs out of memory | Low RAM | Add `NODE_OPTIONS=--max-old-space-size=1536` before `pnpm build` |
| SSL cert fails | DNS not propagated yet | Wait 30 min and retry `sudo certbot --nginx -d ...` |
| Images not loading | Supabase bucket private | Set bucket to public in Supabase Storage settings |
| CORS errors in browser | `FRONTEND_URL` wrong in admin `.env` | Update `.env`, then `pm2 restart artist-admin` |
| Changes not live after deploy | Old build still running | Make sure `pm2 restart` ran after `pnpm build` |
| Port 3000/3001 already in use | Another process on the port | `sudo lsof -i :3000` to find and kill it |

---

## 16. Security Hardening (Recommended)

```bash
# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no  (use SSH keys instead)
sudo systemctl restart ssh

# Install fail2ban to block brute-force attempts
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Keep packages updated automatically
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Summary

| Step | What happens |
|---|---|
| Install deps | Node 20, pnpm, PM2, Nginx, Certbot |
| Clone repo | Both apps in one directory |
| Set `.env` files | One per app with production values |
| `pnpm build` | Compiles both Next.js apps |
| PM2 | Runs admin on :3000, frontend on :3001, survives reboots |
| Nginx | Routes traffic by domain, handles SSL |
| Certbot | Free HTTPS certificates, auto-renewing |
| Updates | `git pull` → `pnpm build` → `pm2 restart` |
