const jwt = require("jsonwebtoken");
require("dotenv").config();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

exports.adminLogin = (req, res) => {
  console.log("\n=== Login Attempt ===");
  console.log("Password provided:", req.body.password ? "yes" : "no");

  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      {
        role: "admin",
        timestamp: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    console.log("✓ Login successful, token generated");

 
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      token,
    });
  }

  console.log("✗ Login failed - invalid password");
  return res.status(401).json({
    success: false,
    message: "Invalid password",
  });
};

exports.verifyAdmin = (req, res, next) => {
  console.log("\n=== Auth Check ===");
  
  // ✅ Check for x-admin-password header first
  const adminPassword = req.headers["x-admin-password"];
  
  if (adminPassword && adminPassword === process.env.ADMIN_PASSWORD) {
    console.log("✓ Authenticated via admin password");
    return next();
  }

  // Fallback to JWT token verification (for future use)
  try {
    const token = req.cookies?.adminToken || 
                  req.headers.authorization?.split(" ")[1];
    
    if (token) {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      console.log("✓ Authenticated via JWT token");
      return next();
    }
  } catch (error) {
    console.log("✗ JWT verification failed:", error.message);
  }

  console.log("✗ Authentication failed");
  return res.status(401).json({
    success: false,
    message: "Unauthorized: Invalid credentials",
  });
};