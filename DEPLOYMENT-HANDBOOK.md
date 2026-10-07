# Versatile Instruments Deployment Handbook

This guide explains how to put the website on one Amazon EC2 server.

Public website domain:

```text
https://versatileinstruments.com
```

## 1. What will run on the server

```text
React website       → public pages and admin panel
Node.js backend     → products, login, uploads and enquiry forms
Nginx               → domain, HTTPS and request forwarding
Persistent folder   → products, enquiries and uploaded images
```

The backend should run as **one process only**. The current product data is stored in one JSON file, so it is not designed for multiple backend servers.

## 2. What the hosting person needs before starting

```text
EC2 server access (SSH / PEM key)
Domain DNS access
Ubuntu or another Linux server
Node.js installed
Nginx installed
An HTTPS certificate, usually Let's Encrypt
Email settings: Zoho SMTP or Resend
```

## 3. Prepare the EC2 server

Run these commands after logging in to the EC2 Ubuntu server:

```bash
sudo apt update
sudo apt install -y git nginx curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

The final two commands confirm that Node.js and npm are installed.

## 4. Get the code from GitHub

On the EC2 server, clone the private GitHub repository and enter the project folder.

```bash
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
cd /var/www
git clone https://github.com/codewithkrishna09/versatile-instruments.git
cd versatile-instruments
npm ci
```

`npm ci` installs the exact package versions listed in the project lock file.

## 5. Create the permanent data folder

Create a protected folder outside the project directory:

```bash
sudo mkdir -p /var/lib/versatile-data
sudo chown -R "$USER":"$USER" /var/lib/versatile-data
```

This folder keeps data safe when the website code is updated or the backend is restarted.

```text
/var/lib/versatile-data/store.json
    Products, categories, admin record, contact enquiries and quotations

/var/lib/versatile-data/uploads/
    Product images uploaded from the admin panel

/var/lib/versatile-data/mail-outbox/
    Pending customer email receipts
```

Set up a regular backup of `/var/lib/versatile-data`.

### Restore the initial catalogue

The GitHub repository contains a safe initial catalogue at
`deployment/catalogue-seed`. It has the published categories, products and
their uploaded images. It does not contain an admin password, contact messages
or quotation requests.

Run this once on a new EC2 server, before opening the website:

```bash
cd /var/www/versatile-instruments
cp -R deployment/catalogue-seed/. /var/lib/versatile-data/
sudo chown -R "$USER":"$USER" /var/lib/versatile-data
```

## 6. Create the private server environment file

Create this file on EC2:

```text
PROJECT_FOLDER/server/.env
```

Open it with:

```bash
cd /var/www/versatile-instruments
nano server/.env
```

Do not upload this file to GitHub. Add real values on the server only:

```env
NODE_ENV=production
PORT=5003
CLIENT_ORIGIN=https://versatileinstruments.com
TRUST_PROXY_HOPS=1
PERSISTENT_DATA_DIRECTORY=/var/lib/versatile-data

ADMIN_LOGIN_EMAIL=admin@versatileinstruments.com
ADMIN_LOGIN_PASSWORD=replace-with-a-strong-password
ADMIN_SETUP_TOKEN=replace-with-a-long-random-token

# Resend customer acknowledgement email
RESEND_API_KEY=re_add-the-private-production-key-here
MAIL_FROM=Versatile Instruments <no-reply@versatileinstruments.com>

SHARED_CATALOGUE_URL=https://your-public-brochure-link.pdf
```

Use the exact public website domain in `CLIENT_ORIGIN`. Do not keep `http://localhost:5173` in production. `MAIL_FROM` must be a verified sender in Resend. Do not add the Resend key to GitHub or to the frontend.

`ADMIN_SETUP_TOKEN` is needed only when creating the first production admin through the setup form. If `ADMIN_LOGIN_EMAIL` and `ADMIN_LOGIN_PASSWORD` are set, use those to log in and the setup token is not needed. Never share the `.env` file or its values.

## 7. Build the frontend

Run this from the project root:

```bash
npm run build
```

This creates the public website files here:

```text
client/dist
```

## 8. Start the backend and keep it running

The backend runs on port `5003`:

```bash
sudo tee /etc/systemd/system/versatile-api.service > /dev/null <<'EOF'
[Unit]
Description=Versatile Instruments API
After=network.target

[Service]
Type=simple
User=YOUR_SERVER_USER
WorkingDirectory=/var/www/versatile-instruments
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now versatile-api
sudo systemctl status versatile-api
```

Replace `YOUR_SERVER_USER` with the Linux account used to clone the project. The backend will now start automatically after a server restart. If the service does not start, see its logs with:

```bash
sudo journalctl -u versatile-api -n 50 --no-pager
```

### Why port 5003 is used

Port `5003` is the private port for the Node.js backend. Visitors never open this port directly.

```text
Visitor opens https://versatileinstruments.com
        ↓
Nginx receives HTTPS traffic on port 443
        ↓
Nginx forwards /api and /uploads requests to port 5003
```

This keeps the backend private and lets Nginx handle the public domain and HTTPS.

Before Nginx is configured, test the backend locally on EC2:

```bash
curl http://127.0.0.1:5003/api/health
```

Expected response:

```json
{"status":"ok"}
```

## 9. Configure Nginx

Create the Nginx website configuration:

```bash
sudo nano /etc/nginx/sites-available/versatileinstruments.com
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name versatileinstruments.com;

    root /var/www/versatile-instruments/client/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable it and check Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/versatileinstruments.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

The `/api` path handles products, admin login, image uploads and forms. The `/uploads` path shows uploaded product images.

## 10. Connect domain, HTTPS and firewall

```text
Domain DNS          → EC2 public IP address
Port 80             → HTTP
Port 443            → HTTPS
Port 22             → SSH, restricted to authorised IP addresses
Port 5003           → do not expose publicly
```

Nginx handles the public HTTPS connection. The Node.js backend stays private on port `5003`.

After DNS points to EC2, install the SSL certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d versatileinstruments.com
```

`versatileinstruments.com` must point to the EC2 IP before running this command. Add `www` later only when its DNS record and permanent redirect are configured.

Then test:

```bash
curl https://versatileinstruments.com/api/health
```

## 11. Final testing checklist

After deployment, test all of these on the real HTTPS domain:

```text
Home page opens
Products page loads
Contact page map opens
Admin login works
Admin can add a category
Admin can upload a product image
Admin can create a product and publish it
Published product appears on the public website
Contact form saves a message in Admin
Quotation form saves a request in Admin
Customer email receipt is delivered
Server restart does not delete products or images
```

## Important notes

```text
Current product data → persistent JSON file
Current product images → persistent EC2 uploads folder
Cloudinary is not required for the current single-server deployment.
Docker is optional; the backend can run directly with Node.js, PM2/systemd and Nginx.
Amazon S3 placeholders exist, but S3 image upload code is not active yet.
```

For the technical settings and environment-variable reference, see `DEPLOYMENT-HANDOFF.md`.
