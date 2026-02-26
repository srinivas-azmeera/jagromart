require('dotenv').config();
const connectDB = require('./config/db');
const Product   = require('./models/Product');
const User      = require('./models/User');

const products = [
  {name:"Fresh Red Apples",brand:"JagroMart Fresh",category:"fruits",icon:"🍎",price:89,mrp:120,weight:"500g",stock:200,badge:"sale",rating:4.5,reviews:1240},
  {name:"Banana Robusta",brand:"JagroMart Fresh",category:"fruits",icon:"🍌",price:35,mrp:45,weight:"1 Dozen",stock:150,badge:"",rating:4.3,reviews:890},
  {name:"Kesar Mango",brand:"JagroMart Fresh",category:"fruits",icon:"🥭",price:149,mrp:200,weight:"1 Kg",stock:80,badge:"hot",rating:4.8,reviews:3200},
  {name:"Seedless Grapes",brand:"JagroMart Fresh",category:"fruits",icon:"🍇",price:79,mrp:100,weight:"500g",stock:120,badge:"sale",rating:4.4,reviews:670},
  {name:"Watermelon Whole",brand:"JagroMart Fresh",category:"fruits",icon:"🍉",price:59,mrp:80,weight:"~3Kg",stock:50,badge:"",rating:4.2,reviews:540},
  {name:"Orange Nagpur",brand:"JagroMart Fresh",category:"fruits",icon:"🍊",price:69,mrp:90,weight:"1 Kg",stock:160,badge:"",rating:4.6,reviews:890},
  {name:"Fresh Tomato",brand:"JagroMart Fresh",category:"vegetables",icon:"🍅",price:29,mrp:40,weight:"500g",stock:300,badge:"",rating:4.1,reviews:2100},
  {name:"Green Capsicum",brand:"JagroMart Fresh",category:"vegetables",icon:"🫑",price:39,mrp:55,weight:"250g",stock:100,badge:"new",rating:4.0,reviews:430},
  {name:"Fresh Broccoli",brand:"JagroMart Fresh",category:"vegetables",icon:"🥦",price:49,mrp:70,weight:"500g",stock:80,badge:"",rating:4.5,reviews:780},
  {name:"Baby Spinach",brand:"JagroMart Fresh",category:"vegetables",icon:"🥬",price:35,mrp:50,weight:"200g",stock:90,badge:"new",rating:4.3,reviews:560},
  {name:"Onion Red",brand:"JagroMart Fresh",category:"vegetables",icon:"🧅",price:25,mrp:35,weight:"1 Kg",stock:500,badge:"",rating:4.0,reviews:3400},
  {name:"Garlic Bulb",brand:"JagroMart Fresh",category:"vegetables",icon:"🧄",price:30,mrp:45,weight:"250g",stock:200,badge:"",rating:4.4,reviews:1100},
  {name:"Amul Taaza Milk",brand:"Amul",category:"dairy",icon:"🥛",price:29,mrp:30,weight:"500ml",stock:400,badge:"",rating:4.7,reviews:8900},
  {name:"Amul Butter",brand:"Amul",category:"dairy",icon:"🧈",price:55,mrp:60,weight:"100g",stock:200,badge:"",rating:4.8,reviews:5600},
  {name:"Amul Cheese Slice",brand:"Amul",category:"dairy",icon:"🧀",price:110,mrp:130,weight:"200g",stock:150,badge:"sale",rating:4.6,reviews:2300},
  {name:"Nestlé Curd",brand:"Nestlé",category:"dairy",icon:"🍶",price:45,mrp:55,weight:"400g",stock:180,badge:"",rating:4.3,reviews:1200},
  {name:"Amul Gold Milk",brand:"Amul",category:"dairy",icon:"🍼",price:32,mrp:35,weight:"500ml",stock:350,badge:"hot",rating:4.9,reviews:7800},
  {name:"Paneer Fresh",brand:"JagroMart Fresh",category:"dairy",icon:"🫙",price:89,mrp:110,weight:"200g",stock:100,badge:"",rating:4.5,reviews:890},
  {name:"Tata Salt",brand:"Tata",category:"staples",icon:"🧂",price:24,mrp:28,weight:"1 Kg",stock:500,badge:"",rating:4.6,reviews:12000},
  {name:"Fortune Refined Oil",brand:"ITC",category:"staples",icon:"🫙",price:135,mrp:160,weight:"1L",stock:200,badge:"sale",rating:4.4,reviews:4500},
  {name:"India Gate Basmati",brand:"Tata",category:"staples",icon:"🌾",price:179,mrp:220,weight:"1 Kg",stock:250,badge:"hot",rating:4.7,reviews:8100},
  {name:"Tata Dal Masoor",brand:"Tata",category:"staples",icon:"🫘",price:99,mrp:120,weight:"500g",stock:300,badge:"",rating:4.5,reviews:3200},
  {name:"Aashirvaad Atta",brand:"ITC",category:"staples",icon:"🌾",price:280,mrp:320,weight:"5 Kg",stock:150,badge:"",rating:4.8,reviews:15000},
  {name:"MDH Chilli Powder",brand:"ITC",category:"staples",icon:"🌶️",price:65,mrp:80,weight:"200g",stock:180,badge:"",rating:4.5,reviews:2800},
  {name:"Haldiram's Bhujia",brand:"Haldiram's",category:"snacks",icon:"🍿",price:55,mrp:70,weight:"200g",stock:300,badge:"hot",rating:4.6,reviews:9800},
  {name:"Parle-G Biscuits",brand:"Parle",category:"snacks",icon:"🍪",price:10,mrp:10,weight:"100g",stock:1000,badge:"",rating:4.9,reviews:25000},
  {name:"Lay's Classic",brand:"ITC",category:"snacks",icon:"🥔",price:20,mrp:25,weight:"26g",stock:400,badge:"",rating:4.3,reviews:7800},
  {name:"Britannia Good Day",brand:"Britannia",category:"snacks",icon:"🍪",price:35,mrp:40,weight:"150g",stock:350,badge:"sale",rating:4.5,reviews:5600},
  {name:"Kurkure Masala",brand:"ITC",category:"snacks",icon:"🌽",price:20,mrp:25,weight:"90g",stock:500,badge:"",rating:4.4,reviews:6700},
  {name:"Haldiram's Mixture",brand:"Haldiram's",category:"snacks",icon:"🥜",price:65,mrp:80,weight:"200g",stock:200,badge:"",rating:4.5,reviews:3400},
  {name:"Tata Tea Gold",brand:"Tata",category:"beverages",icon:"☕",price:199,mrp:240,weight:"250g",stock:200,badge:"sale",rating:4.7,reviews:12000},
  {name:"Nescafé Classic",brand:"Nestlé",category:"beverages",icon:"☕",price:245,mrp:290,weight:"200g",stock:150,badge:"",rating:4.6,reviews:8900},
  {name:"Appy Fizz",brand:"Tata",category:"beverages",icon:"🧃",price:30,mrp:35,weight:"250ml",stock:300,badge:"new",rating:4.2,reviews:2300},
  {name:"Tropicana Orange",brand:"ITC",category:"beverages",icon:"🍊",price:89,mrp:110,weight:"1L",stock:180,badge:"sale",rating:4.4,reviews:4500},
  {name:"Bisleri Water",brand:"ITC",category:"beverages",icon:"💧",price:20,mrp:20,weight:"1L",stock:500,badge:"",rating:4.5,reviews:6700},
  {name:"Dove Soap Bar",brand:"ITC",category:"personal",icon:"🧼",price:55,mrp:70,weight:"75g",stock:300,badge:"sale",rating:4.7,reviews:15000},
  {name:"Colgate MaxFresh",brand:"ITC",category:"personal",icon:"🪥",price:89,mrp:110,weight:"150g",stock:200,badge:"",rating:4.5,reviews:8900},
  {name:"Pantene Shampoo",brand:"ITC",category:"personal",icon:"🧴",price:149,mrp:180,weight:"180ml",stock:150,badge:"sale",rating:4.4,reviews:5600},
  {name:"Dettol Hand Wash",brand:"ITC",category:"personal",icon:"🧴",price:99,mrp:120,weight:"200ml",stock:250,badge:"",rating:4.6,reviews:12000},
  {name:"Vim Dishwash Bar",brand:"ITC",category:"cleaning",icon:"🧹",price:30,mrp:40,weight:"200g",stock:300,badge:"",rating:4.4,reviews:6700},
  {name:"Harpic Cleaner",brand:"ITC",category:"cleaning",icon:"🚿",price:89,mrp:110,weight:"500ml",stock:200,badge:"sale",rating:4.5,reviews:4500},
  {name:"Surf Excel Matic",brand:"ITC",category:"cleaning",icon:"🫧",price:299,mrp:360,weight:"1 Kg",stock:150,badge:"sale",rating:4.6,reviews:9800},
  {name:"McCain Aloo Tikki",brand:"Nestlé",category:"frozen",icon:"❄️",price:99,mrp:130,weight:"400g",stock:100,badge:"new",rating:4.3,reviews:2100},
  {name:"Amul Vanilla Ice Cream",brand:"Amul",category:"frozen",icon:"🍦",price:55,mrp:70,weight:"500ml",stock:150,badge:"hot",rating:4.7,reviews:8900},
  {name:"Frozen Sweet Corn",brand:"JagroMart Fresh",category:"frozen",icon:"🌽",price:69,mrp:85,weight:"500g",stock:80,badge:"",rating:4.2,reviews:780},
];

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded`);
  const exists = await User.findOne({ role:'admin' });
  if (!exists) {
    await User.create({ name:'Jagan Nayak', email:'admin@jagromart.com', phone:'9876543210', password:'Admin@123', role:'admin' });
    console.log('✅ Admin: admin@jagromart.com / Admin@123');
  }
  console.log('🎉 Done!');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
