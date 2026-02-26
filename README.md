# 🛒 JagroMart – Full Stack Grocery Store

A complete, production-ready full-stack grocery e-commerce website.
**Node.js + Express + MongoDB + JWT** — ready to publish!

---

## 📁 Project Structure

```
jagromart/
├── public/              ← Frontend (HTML/CSS/JS)
│   ├── index.html       ← Homepage
│   ├── css/style.css    ← Shared styles
│   ├── js/app.js        ← Shared JS (API, auth, cart)
│   └── pages/
│       ├── login.html   ← Login & Register
│       ├── shop.html    ← Product listing (live from DB)
│       ├── checkout.html← Checkout & order placement
│       ├── account.html ← My orders & profile
│       └── admin.html   ← Admin dashboard
├── src/
│   ├── config/db.js
│   ├── models/          ← User, Product, Order
│   ├── controllers/     ← Auth, Product, Order logic
│   ├── routes/index.js
│   ├── middleware/auth.js
│   └── seed.js          ← Seeds DB with 45+ products
├── server.js            ← Main entry (serves frontend + API)
├── Procfile             ← For Railway/Heroku
├── .env.example
└── package.json
```

---

## ⚡ Quick Start (Local)

### Step 1 — Get a free MongoDB database
👉 https://cloud.mongodb.com → Create free cluster → Get connection URI

### Step 2 — Setup environment
```bash
cp .env.example .env
# Edit .env and paste your MongoDB URI
```

### Step 3 — Install & seed
```bash
npm install
npm run seed     # Seeds 45+ products + admin account
```

### Step 4 — Run
```bash
npm run dev      # Development (auto-restart)
npm start        # Production
```

Visit: **http://localhost:5000** 🎉

---

## 🔐 Default Admin Account
```
Email:    admin@jagromart.com
Password: Admin@123
```
Access admin panel: **http://localhost:5000/admin**

---

## 🌐 Pages

| URL | Page |
|-----|------|
| `/` | Homepage (Hero, About, Services, Contact) |
| `/shop` | Product listing with live DB, cart, filters |
| `/login` | Login & Register |
| `/checkout` | Address, promo codes, payment, place order |
| `/account` | Order tracking, profile update |
| `/admin` | Admin dashboard (orders, stock management) |

---

## 📡 API Endpoints

### Auth → `/api/auth/*`
- `POST /register` — Create account
- `POST /login` — Login (returns JWT token)
- `GET /me` — Get my profile (auth required)
- `PUT /profile` — Update name/phone
- `PUT /change-password` — Change password
- `POST /address` — Add delivery address

### Products → `/api/products/*`
- `GET /` — List all (supports ?category, ?search, ?maxPrice, ?sort)
- `GET /:id` — Single product
- `GET /check/:id?qty=2` — Check stock availability
- `POST /` — Add product (admin only)
- `PUT /:id` — Edit product (admin only)
- `PUT /:id/stock` — Update stock (admin only)
- `DELETE /:id` — Remove product (admin only)

### Orders → `/api/orders/*`
- `POST /` — Place order
- `POST /promo/validate` — Validate promo code
- `GET /my` — My orders
- `GET /my/:id` — Single order + tracking
- `PUT /my/:id/cancel` — Cancel order
- `GET /admin/all` — All orders (admin)
- `GET /admin/dashboard` — Stats (admin)
- `PUT /admin/:id/status` — Update status (admin)

---

## 🎟️ Promo Codes
| Code | Discount | Min Order |
|------|----------|-----------|
| `JAGRO10` | 10% off | ₹300 |
| `JAGRO50` | ₹50 flat | ₹500 |
| `FRESH20` | 20% off | ₹600 |
| `NEWUSER` | ₹100 flat | ₹400 |

---

## 🚀 Deploy to Railway (FREE — Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "JagroMart initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/jagromart.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repo
   - Add environment variables:
     ```
     MONGO_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_secret_key
     ADMIN_SECRET=your_admin_secret
     NODE_ENV=production
     ```
   - Railway auto-detects Node.js and deploys!
   - Your app is live at `https://jagromart.up.railway.app` 🎉

3. **Seed the database** (run once after deploy)
   - In Railway dashboard → click your app → "Run Command"
   - Run: `node src/seed.js`

---

## 🌍 Custom Domain (e.g. jagromart.com)

1. Buy domain at GoDaddy / Namecheap / BigRock
2. In Railway: Settings → Domains → Add custom domain
3. Update your domain DNS to point to Railway
4. Done! Your site is live at `www.jagromart.com`

---

## 👨‍💼 Owner
**Jagan Nayak** — Founder, JagroMart
📧 admin@jagromart.com
