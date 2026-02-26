const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  brand:       { type: String, required: true },
  category:    { type: String, required: true, enum: ['fruits','vegetables','dairy','staples','snacks','beverages','personal','cleaning','frozen'] },
  icon:        { type: String, default: '🛒' },
  description: { type: String, default: '' },
  weight:      { type: String, required: true },
  price:       { type: Number, required: true },
  mrp:         { type: Number, required: true },
  stock:       { type: Number, required: true, default: 100 },
  badge:       { type: String, enum: ['sale','new','hot',''], default: '' },
  rating:      { type: Number, default: 4.0 },
  reviews:     { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('discount').get(function() {
  return this.mrp > this.price ? Math.round(((this.mrp - this.price) / this.mrp) * 100) : 0;
});
productSchema.virtual('inStock').get(function() { return this.stock > 0; });
productSchema.index({ name: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);
