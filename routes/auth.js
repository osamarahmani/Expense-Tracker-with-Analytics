const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const prisma  = require("../utils/prisma");

const SECRET = process.env.JWT_SECRET || "fintrack_super_secret_key_2024";

// ── LOGIN ──────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found." });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "Incorrect password." });

    const token = jwt.sign(
      { userId: user.id, role: user.role, name: user.name },
      SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── REGISTER ───────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required." });

    if (password.length < 4)
      return res.status(400).json({ message: "Password must be at least 4 characters." });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "An account with this email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
    });

    res.json({ message: "Account created successfully!", user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
