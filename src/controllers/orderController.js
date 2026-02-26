const Order   = require('../models/Order');
const Product = require('../models/Product');

const PROMOS = {
  JAGRO10: { type:'percent', value:10, minOrder:300 },
  JAGRO50: { type:'flat',    value:50, minOrder:500 },
  FRESH20: { type:'percent', value:20, minOrder:600 },
  NEWUSER: { type:'flat',    value:100, minOrder:400 },
};

const validatePromo = (req, res) => {
  const { code, subtotal } = req.body;
  const promo = PROMOS[code?.toUpperCase()];
  if (!promo) return res.status(400).json({ success:false, message:'Invalid promo code.' });
  if (subtotal < promo.minOrder) return res.status(400).json({ success:false, message:`Minimum order ₹${promo.minOrder} required.` });
  const discount = promo.type==='percent' ? Math.round((promo.value/100)*subtotal) : promo.value;
  res.json({ success:true, message:`🎉 You save ₹${discount}!`, discount });
};

const placeOrder = async (req, res, next) => {
  try {
    const { items, address, paymentMethod, promoCode } = req.body;
    if (!items?.length) return res.status(400).json({ success:false, message:'Cart is empty.' });

    let subtotal=0, orderItems=[], stockUpdates=[];

    for (const item of items) {
      const p = await Product.findById(item.productId);
      if (!p||!p.isActive) return res.status(400).json({ success:false, message:`"${item.name}" not available.` });
      if (p.stock < item.qty) return res.status(400).json({ success:false, message:`Only ${p.stock} unit(s) of "${p.name}" left.`, available:p.stock });
      const sub = p.price * item.qty;
      subtotal += sub;
      orderItems.push({ product:p._id, name:p.name, icon:p.icon, brand:p.brand, weight:p.weight, price:p.price, qty:item.qty, subtotal:sub });
      stockUpdates.push({ id:p._id, qty:item.qty });
    }

    const deliveryCharge = subtotal >= 499 ? 0 : 49;
    let discount=0, appliedPromo='';
    if (promoCode) {
      const pr = PROMOS[promoCode.toUpperCase()];
      if (pr && subtotal >= pr.minOrder) {
        discount = pr.type==='percent' ? Math.round((pr.value/100)*subtotal) : pr.value;
        appliedPromo = promoCode.toUpperCase();
      }
    }
    const total = subtotal + deliveryCharge - discount;
    const estimatedDelivery = new Date(Date.now() + 24*60*60*1000);

    const order = await Order.create({
      user: req.user._id, items: orderItems, address,
      subtotal, deliveryCharge, discount, promoCode: appliedPromo, total,
      paymentMethod: paymentMethod||'COD',
      paymentStatus: paymentMethod==='COD' ? 'pending' : 'paid',
      estimatedDelivery,
      timeline: [{ status:'placed', message:'🛒 Order placed successfully!' }],
    });

    for (const u of stockUpdates) await Product.findByIdAndUpdate(u.id, { $inc:{ stock:-u.qty } });

    res.status(201).json({ success:true, message:'✅ Order placed!', order:{
      orderId:order.orderId, _id:order._id, status:order.status, total:order.total,
      estimatedDelivery:order.estimatedDelivery, paymentMethod:order.paymentMethod
    }});
  } catch(err) { next(err); }
};

const getMyOrders  = async (req, res, next) => { try { const orders = await Order.find({user:req.user._id}).sort({createdAt:-1}); res.json({success:true,total:orders.length,orders}); } catch(err){next(err);} };
const getOrderById = async (req, res, next) => { try { const o = await Order.findOne({$or:[{_id:req.params.id,user:req.user._id},{orderId:req.params.id,user:req.user._id}]}); if(!o) return res.status(404).json({success:false,message:'Not found.'}); res.json({success:true,order:o}); } catch(err){next(err);} };

const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({_id:req.params.id,user:req.user._id});
    if (!order) return res.status(404).json({success:false,message:'Not found.'});
    if (['shipped','out_for_delivery','delivered'].includes(order.status))
      return res.status(400).json({success:false,message:`Cannot cancel: order is ${order.status}.`});
    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by user';
    order.timeline.push({ status:'cancelled', message:`❌ Cancelled: ${order.cancelReason}` });
    for (const item of order.items) await Product.findByIdAndUpdate(item.product, {$inc:{stock:item.qty}});
    await order.save();
    res.json({success:true,message:'Order cancelled.',order});
  } catch(err) { next(err); }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    const filter = status ? {status} : {};
    const total  = await Order.countDocuments(filter);
    const orders = await Order.find(filter).populate('user','name email phone').sort({createdAt:-1}).skip((+page-1)*+limit).limit(+limit);
    res.json({success:true,total,pages:Math.ceil(total/+limit),orders});
  } catch(err) { next(err); }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({success:false,message:'Not found.'});
    order.status = status;
    if (status==='delivered') { order.deliveredAt = new Date(); order.paymentStatus='paid'; }
    const msgs = { confirmed:'✅ Confirmed.',packed:'📦 Packed.',shipped:'🚚 Shipped.',out_for_delivery:'🛵 Out for delivery.',delivered:'🎉 Delivered!',cancelled:'❌ Cancelled.' };
    order.timeline.push({ status, message: message||msgs[status] });
    await order.save();
    res.json({success:true,order});
  } catch(err) { next(err); }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const [total,pending,delivered,cancelled,revenue,lowStock,recent] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({status:{$in:['placed','confirmed','packed','shipped','out_for_delivery']}}),
      Order.countDocuments({status:'delivered'}),
      Order.countDocuments({status:'cancelled'}),
      Order.aggregate([{$match:{status:'delivered'}},{$group:{_id:null,total:{$sum:'$total'}}}]),
      Product.find({stock:{$lt:10},isActive:true}).select('name stock category brand').limit(10),
      Order.find().sort({createdAt:-1}).limit(5).populate('user','name email'),
    ]);
    res.json({success:true,stats:{total,pending,delivered,cancelled,revenue:revenue[0]?.total||0},lowStock,recent});
  } catch(err) { next(err); }
};

module.exports = { placeOrder,getMyOrders,getOrderById,cancelOrder,getAllOrders,updateOrderStatus,getDashboardStats,validatePromo };
