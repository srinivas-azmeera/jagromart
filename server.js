require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const connectDB  = require('./src/config/db');

connectDB();

const app = express();

// ── Middleware ──
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Rate limiting ──
app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 300, message: { success:false, message:'Too many requests.' } }));

// ── Static files ──
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──
app.use('/api', require('./src/routes/index'));

// ── Page Routes (serve HTML) ──
const pages = path.join(__dirname, 'public', 'pages');
app.get('/login',    (req,res) => res.sendFile(path.join(pages, 'login.html')));
app.get('/shop',     (req,res) => res.sendFile(path.join(pages, 'shop.html')));
app.get('/checkout', (req,res) => res.sendFile(path.join(pages, 'checkout.html')));
app.get('/account',  (req,res) => res.sendFile(path.join(pages, 'account.html')));
app.get('/admin',    (req,res) => res.sendFile(path.join(pages, 'admin.html')));

// ── Health check ──
app.get('/health', (req,res) => res.json({ status:'ok', timestamp: new Date().toISOString() }));

// ── 404 fallback → homepage ──
app.get('*', (req,res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  let msg = err.message || 'Internal Server Error';
  let code = err.statusCode || 500;
  if (err.code===11000) { msg=`${Object.keys(err.keyValue)[0]} already exists.`; code=400; }
  if (err.name==='ValidationError') { msg=Object.values(err.errors).map(e=>e.message).join(', '); code=400; }
  res.status(code).json({ success:false, message:msg });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🛒  JagroMart Full-Stack App           ║
  ║   🚀  http://localhost:${PORT}              ║
  ║   📦  API: http://localhost:${PORT}/api     ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = app;
