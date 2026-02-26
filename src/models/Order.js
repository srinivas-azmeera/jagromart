const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String, unique: true,
    default: () => 'JGM' + Date.now().toString().slice(-7) + Math.random().toString(36).slice(2,5).toUpperCase()
  },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:     String, icon: String, brand: String, weight: String,
    price:    Number, qty: Number, subtotal: Number,
  }],
  address: {
    name: String, phone: String, street: String,
    city: String, state: String, pincode: String,
  },
  subtotal:       { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  discount:       { type: Number, default: 0 },
  promoCode:      { type: String, default: '' },
  total:          { type: Number, required: true },
  paymentMethod:  { type: String, enum: ['COD','UPI','CARD','NETBANKING'], default: 'COD' },
  paymentStatus:  { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  status: {
    type: String,
    enum: ['placed','confirmed','packed','shipped','out_for_delivery','delivered','cancelled'],
    default: 'placed'
  },
  timeline: [{ status: String, message: String, timestamp: { type: Date, default: Date.now } }],
  estimatedDelivery: Date,
  deliveredAt:       Date,
  cancelReason:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
