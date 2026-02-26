const express = require('express');
const r = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const A = require('../controllers/authController');
const P = require('../controllers/productController');
const O = require('../controllers/orderController');

// Auth
r.post('/auth/register',        A.register);
r.post('/auth/login',           A.login);
r.get('/auth/me',               protect, A.getMe);
r.put('/auth/profile',          protect, A.updateProfile);
r.put('/auth/change-password',  protect, A.changePassword);
r.post('/auth/address',         protect, A.addAddress);
r.delete('/auth/address/:id',   protect, A.deleteAddress);

// Products
r.get('/products',                      P.getProducts);
r.get('/products/categories/summary',   P.getCategorySummary);
r.get('/products/check/:id',            P.checkAvailability);
r.get('/products/:id',                  P.getProduct);
r.post('/products',                     protect, adminOnly, P.createProduct);
r.put('/products/:id',                  protect, adminOnly, P.updateProduct);
r.put('/products/:id/stock',            protect, adminOnly, P.updateStock);
r.delete('/products/:id',               protect, adminOnly, P.deleteProduct);

// Orders
r.post('/orders',                       protect, O.placeOrder);
r.post('/orders/promo/validate',        protect, O.validatePromo);
r.get('/orders/my',                     protect, O.getMyOrders);
r.get('/orders/my/:id',                 protect, O.getOrderById);
r.put('/orders/my/:id/cancel',          protect, O.cancelOrder);
r.get('/orders/admin/all',              protect, adminOnly, O.getAllOrders);
r.get('/orders/admin/dashboard',        protect, adminOnly, O.getDashboardStats);
r.put('/orders/admin/:id/status',       protect, adminOnly, O.updateOrderStatus);

module.exports = r;
