const Product = require('../models/Product');

const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, brand, inStock, sort, page=1, limit=48 } = req.query;
    const filter = { isActive: true };
    if (category && category !== 'all') filter.category = category;
    if (brand)   filter.brand = { $regex: brand, $options: 'i' };
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (minPrice || maxPrice) { filter.price = {}; if (minPrice) filter.price.$gte = +minPrice; if (maxPrice) filter.price.$lte = +maxPrice; }
    if (search)  filter.$text = { $search: search };
    const sortMap = { price_asc:{price:1}, price_desc:{price:-1}, rating:{rating:-1}, discount:{mrp:-1}, newest:{createdAt:-1} };
    const total    = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort(sortMap[sort]||{createdAt:-1}).skip((+page-1)*+limit).limit(+limit);
    res.json({ success:true, total, page:+page, pages:Math.ceil(total/+limit), products });
  } catch(err) { next(err); }
};

const getProduct = async (req, res, next) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p||!p.isActive) return res.status(404).json({ success:false, message:'Product not found.' });
    res.json({ success:true, product:p });
  } catch(err) { next(err); }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { qty=1 } = req.query;
    const p = await Product.findById(req.params.id).select('name stock price mrp isActive');
    if (!p||!p.isActive) return res.json({ success:false, available:false });
    const available = p.stock >= +qty;
    res.json({ success:true, available, stock:p.stock, requested:+qty,
      message: available ? `✅ Available (${p.stock} in stock)` : `❌ Only ${p.stock} left` });
  } catch(err) { next(err); }
};

const createProduct  = async (req, res, next) => { try { const p = await Product.create(req.body); res.status(201).json({ success:true, product:p }); } catch(err) { next(err); } };
const updateProduct  = async (req, res, next) => { try { const p = await Product.findByIdAndUpdate(req.params.id, req.body, {new:true,runValidators:true}); if(!p) return res.status(404).json({success:false,message:'Not found'}); res.json({success:true,product:p}); } catch(err){next(err);} };
const updateStock    = async (req, res, next) => { try { const p = await Product.findByIdAndUpdate(req.params.id, {stock:req.body.stock}, {new:true}); res.json({success:true,stock:p.stock,product:p}); } catch(err){next(err);} };
const deleteProduct  = async (req, res, next) => { try { await Product.findByIdAndUpdate(req.params.id,{isActive:false}); res.json({success:true,message:'Product removed.'}); } catch(err){next(err);} };

const getCategorySummary = async (req, res, next) => {
  try {
    const s = await Product.aggregate([{$match:{isActive:true}},{$group:{_id:'$category',count:{$sum:1},avgPrice:{$avg:'$price'}}},{$sort:{count:-1}}]);
    res.json({ success:true, categories:s });
  } catch(err) { next(err); }
};

module.exports = { getProducts, getProduct, checkAvailability, createProduct, updateProduct, updateStock, deleteProduct, getCategorySummary };
