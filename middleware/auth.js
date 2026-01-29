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
  console.log("Path:", req.path);
  console.log("Cookies:", req.cookies);
  console.log(
    "x-admin-password header:",
    req.headers["x-admin-password"] ? "present" : "not present",
  );
  console.log(
    "Authorization header:",
    req.headers.authorization || "not present",
  );

  let token = null;

  if (req.cookies && req.cookies.adminToken) {
    token = req.cookies.adminToken;
    console.log("✓ Authenticated via cookie");
  }
  else if (req.headers["x-admin-password"]) {
    token = req.headers["x-admin-password"];
    console.log("✓ Authenticated via x-admin-password header");
  }
  else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
    console.log("✓ Authenticated via Authorization header");
  }

  if (token) {
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      console.log("✓ Token verified");
      return next();
    } catch (error) {
      console.log("✗ JWT verification failed:", error.message);
    }
  }

  console.log("✗ Authentication failed - no valid credentials");
  return res.status(401).json({
    success: false,
    message: "Unauthorized: Invalid credentials",
  });
};