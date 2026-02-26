const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, adminSecret } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    const role = (adminSecret === process.env.ADMIN_SECRET) ? 'admin' : 'user';
    const user = await User.create({ name, email, phone, password, role });
    res.status(201).json({ success: true, message: 'Account created!', token: generateToken(user._id), user });
  } catch(err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Login successful!', token: generateToken(user._id), user });
  } catch(err) { next(err); }
};

const getMe         = (req, res) => res.json({ success: true, user: req.user });

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { name: req.body.name, phone: req.body.phone }, { new: true });
    res.json({ success: true, user });
  } catch(err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(req.body.currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password incorrect.' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed.' });
  } catch(err) { next(err); }
};

const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch(err) { next(err); }
};

const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch(err) { next(err); }
};

module.exports = { register, login, getMe, updateProfile, changePassword, addAddress, deleteAddress };
