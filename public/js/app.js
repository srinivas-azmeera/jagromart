// ── API BASE ──
const API = '/api';

const api = {
  async request(method, url, body, auth=true) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) { const t = localStorage.getItem('jgm_token'); if(t) headers['Authorization'] = 'Bearer '+t; }
    const res = await fetch(API+url, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json();
    if (!data.success && res.status===401) { logout(); return; }
    return data;
  },
  get:    (url, auth)      => api.request('GET', url, null, auth),
  post:   (url, body, auth)=> api.request('POST', url, body, auth),
  put:    (url, body)      => api.request('PUT',  url, body),
  delete: (url)            => api.request('DELETE', url, null),
};

// ── AUTH ──
function getToken()   { return localStorage.getItem('jgm_token'); }
function getUser()    { try { return JSON.parse(localStorage.getItem('jgm_user')); } catch{ return null; } }
function isLoggedIn() { return !!getToken(); }
function isAdmin()    { const u=getUser(); return u?.role==='admin'; }

function setSession(data) {
  localStorage.setItem('jgm_token', data.token);
  localStorage.setItem('jgm_user',  JSON.stringify(data.user));
}

function logout() {
  localStorage.removeItem('jgm_token');
  localStorage.removeItem('jgm_user');
  localStorage.removeItem('jgm_cart');
  window.location.href = '/';
}

// ── CART ──
function getCart()      { try { return JSON.parse(localStorage.getItem('jgm_cart'))||[]; } catch{ return []; } }
function saveCart(cart) { localStorage.setItem('jgm_cart', JSON.stringify(cart)); updateCartBadge(); }

function addToCart(product, qty=1) {
  const cart = getCart();
  const idx  = cart.findIndex(c => c._id===product._id);
  if (idx>-1) cart[idx].qty = Math.min(cart[idx].qty+qty, product.stock);
  else cart.push({ ...product, qty });
  saveCart(cart);
}

function removeFromCart(id) { saveCart(getCart().filter(c=>c._id!==id)); }
function clearCart()        { saveCart([]); }

function updateCartBadge() {
  const total = getCart().reduce((s,c)=>s+c.qty,0);
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = total;
    el.style.display = total>0 ? 'flex' : 'none';
  });
}

// ── TOAST ──
let _toastT;
function showToast(msg, type='') {
  let el = document.getElementById('globalToast');
  if (!el) { el=document.createElement('div'); el.id='globalToast'; el.className='toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.className = 'toast'+(type?' '+type:'');
  el.classList.add('show');
  clearTimeout(_toastT);
  _toastT = setTimeout(()=>el.classList.remove('show'), 2800);
}

// ── NAV AUTH STATE ──
function renderNavAuth() {
  const loginBtn  = document.getElementById('navLoginBtn');
  const userMenu  = document.getElementById('navUserMenu');
  const userName  = document.getElementById('navUserName');
  const adminLink = document.getElementById('navAdminLink');

  if (isLoggedIn()) {
    if (loginBtn)  loginBtn.style.display  = 'none';
    if (userMenu)  userMenu.style.display  = 'flex';
    if (userName)  userName.textContent    = getUser()?.name?.split(' ')[0] || 'Account';
    if (adminLink) adminLink.style.display = isAdmin() ? 'inline-block' : 'none';
  } else {
    if (loginBtn)  loginBtn.style.display  = 'inline-block';
    if (userMenu)  userMenu.style.display  = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
  updateCartBadge();
}

document.addEventListener('DOMContentLoaded', renderNavAuth);
