const express = require("express");
const router  = express.Router();
const prisma  = require("../utils/prisma");
const auth    = require("../middleware/authMiddleware");

// GET all transactions
router.get("/", auth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });
    res.json(transactions);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ADD transaction
router.post("/", auth, async (req, res) => {
  try {
    const { amount, type, categoryId, description, date } = req.body;
    if (!amount || !type || !categoryId)
      return res.status(400).json({ message: "Amount, type and categoryId are required." });
    if (!["income", "expense"].includes(type))
      return res.status(400).json({ message: "Type must be 'income' or 'expense'." });

    const transaction = await prisma.transaction.create({
      data: {
        amount:      parseFloat(amount),
        type,
        categoryId:  parseInt(categoryId),
        userId:      req.user.userId,
        description: description || "",
        date:        date ? new Date(date) : new Date(),
      },
      include: { category: true },
    });
    res.json(transaction);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx || tx.userId !== req.user.userId)
      return res.status(403).json({ message: "Not allowed." });
    await prisma.transaction.delete({ where: { id } });
    res.json({ message: "Transaction deleted." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
