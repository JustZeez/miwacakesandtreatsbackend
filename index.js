const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const dotenv = require('dotenv').config();
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();


// This is rate limiting it is use to limit each IP to 100 requests per windowMs
const limiter = rateLimit({
    windowMs: 15 * 60 *1000,
    max:100
});

app.use(helmet());
app.use(limiter);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://miwacakesandtreatsfrontend.vercel.app',
  'http://localhost:5173' // for local development
].filter(Boolean); // Remove any undefined/null values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowedOrigins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/orders' , orderRoutes);
app.use('/api/admin', adminRoutes)

app.get('/' , (req, res)=>{
    res.json({message: 'Miwa Cakes & Treats API is running!'});
});

app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong!',
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});