const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  street:   { type: String, required: true },
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  isDefault:{ type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  phone:     { type: String, required: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['user','admin'], default: 'user' },
  addresses: [addressSchema],
  isActive:  { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(pwd) {
  return bcrypt.compare(pwd, this.password);
};

userSchema.methods.toJSON = function() {
  const o = this.toObject();
  delete o.password;
  return o;
};

module.exports = mongoose.model('User', userSchema);
