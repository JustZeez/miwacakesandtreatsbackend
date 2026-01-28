// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

// Accept both x-admin-password AND JWT tokens
exports.verifyAdmin = (req, res, next) => {
  console.log('\n=== Auth Check ===');
  console.log('Path:', req.path);
  console.log('x-admin-password header:', req.headers['x-admin-password'] ? 'present' : 'not present');
  console.log('Authorization header:', req.headers.authorization || 'not present');
  
  // Method 1: Check x-admin-password header
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword && adminPassword === ADMIN_PASSWORD) {
    console.log('✓ Authenticated via x-admin-password');
    return next();
  }
  
  // Method 2: Check JWT token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      console.log('✓ Authenticated via JWT token');
      console.log('Token payload:', verified);
      return next();
    } catch (error) {
      console.log('✗ JWT verification failed:', error.message);
      // Token invalid, continue to error
    }
  }
  
  // Both methods failed
  console.log('✗ Authentication failed - no valid credentials');
  return res.status(401).json({ 
    success: false, 
    message: 'Unauthorized: Invalid credentials' 
  });
};

// Keep login function to generate JWT
exports.adminLogin = (req, res) => {
  console.log('\n=== Login Attempt ===');
  console.log('Password provided:', req.body.password ? 'yes' : 'no');
  
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { 
        role: 'admin',
        timestamp: Date.now() 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    console.log('✓ Login successful, token generated');
    
    return res.json({ 
      success: true, 
      token 
    });
  }
  
  console.log('✗ Login failed - invalid password');
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid password' 
  });
};