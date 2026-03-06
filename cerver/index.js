import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectMssqlDB } from './config/db.js';

// Import routes
import adminRoutes from './routes/admin.route.js';
import cartRoutes from './routes/cart.route.js';
import dashboardRoutes from './routes/dashboard.route.js';
import helpRoutes from './routes/help.route.js';
import homeRoutes from './routes/home.route.js';
import orderRoutes from './routes/order.route.js';
import productRoutes from './routes/product.route.js';
import reportRoutes from './routes/report.route.js';
import searchRoutes from './routes/search.route.js';
import userRoutes from './routes/user.route.js';
import addressRoutes from './routes/address.route.js';
import categoryRoutes from './routes/category.route.js';
import paymentRoutes from './routes/payment.route.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const DEV_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];
const ENV_ALLOWED_ORIGINS = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ✅ SSLCommerz origins যোগ করুন
const SSLCOMMERZ_ORIGINS = [
  "https://sandbox.sslcommerz.com",
  "https://securepay.sslcommerz.com",
  "https://sandbox.sslcommerz.com.bd",
  "https://www.sslcommerz.com"
];

const ALLOWED_ORIGINS = [...new Set([
  ...DEFAULT_ALLOWED_ORIGINS, 
  ...ENV_ALLOWED_ORIGINS,
  ...SSLCOMMERZ_ORIGINS
])];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ আপডেটেড CORS কনফিগারেশন
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman, SSLCommerz)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    
    // Check localhost origins
    if (DEV_ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }
    
    // ✅ SSLCommerz-এর জন্য বিশেষ অনুমতি
    if (origin.includes('sslcommerz.com')) {
      console.log(`✅ CORS allowed for SSLCommerz: ${origin}`);
      return callback(null, true);
    }
    
    // Allow ngrok URLs (for testing)
    if (origin.includes('ngrok-free.app') || origin.includes('ngrok.io')) {
      return callback(null, true);
    }
    
    console.log(`❌ CORS blocked for origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(cookieParser());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // SSLCommerz-এর জন্য প্রয়োজন
}));
app.use(morgan('dev'));

// Connect to MSSQL Database
connectMssqlDB();

app.get('/', (req, res) => {
  res.send('MSSQL Server is running!');
});

// Use routes
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/user', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment', paymentRoutes);

// ✅ 404 handler - must be AFTER all other routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found', 
    error: true, 
    success: false,
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MSSQL Server running on port ${PORT}`);
  console.log(`📍 Available routes:`);
  console.log(`   - http://localhost:${PORT}/`);
  console.log(`   - http://localhost:${PORT}/api/categories`);
  console.log(`   - http://localhost:${PORT}/api/products`);
  console.log(`   - http://localhost:${PORT}/api/user`);
});