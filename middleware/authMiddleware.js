const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "fintrack_super_secret_key_2024";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "No token provided. Please login." });
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
