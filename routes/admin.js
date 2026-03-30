const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const prisma  = require("../utils/prisma");
const auth    = require("../middleware/authMiddleware");
const role    = require("../middleware/roleMiddleware");

// GET all users
router.get("/users", auth, role("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { id: "asc" },
    });
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// CREATE user
router.post("/users", auth, role("ADMIN"), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required." });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already exists." });

    const hashed = await bcrypt.hash(password, 10);
    const user   = await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
    });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE user
router.delete("/users/:id", auth, role("ADMIN"), async (req, res) => {
  try {
    const id   = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.role === "ADMIN") return res.status(403).json({ message: "Cannot delete admin user." });

    // Delete related records first
    await prisma.lentMoney.deleteMany({ where: { userId: id } });
    await prisma.transaction.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    res.json({ message: `User "${user.name}" deleted successfully.` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET user report
router.get("/reports/:userId", auth, role("ADMIN"), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const user   = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) return res.status(404).json({ message: "User not found." });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalIncome  = transactions.filter(t => t.type === "income" ).reduce((s, t) => s + t.amount, 0);

    res.json({ user, totalExpense, totalIncome, transactionCount: transactions.length, transactions });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
