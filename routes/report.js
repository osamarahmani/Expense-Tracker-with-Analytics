const express    = require("express");
const router     = express.Router();
const { Parser } = require("json2csv");
const prisma     = require("../utils/prisma");
const auth       = require("../middleware/authMiddleware");

// Total expense
router.get("/total", auth, async (req, res) => {
  try {
    const total = await prisma.transaction.aggregate({
      where: { userId: req.user.userId, type: "expense" },
      _sum: { amount: true },
    });
    res.json(total);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Total income
router.get("/income", auth, async (req, res) => {
  try {
    const total = await prisma.transaction.aggregate({
      where: { userId: req.user.userId, type: "income" },
      _sum: { amount: true },
    });
    res.json(total);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Category-wise expense
router.get("/category", auth, async (req, res) => {
  try {
    const data = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId: req.user.userId, type: "expense" },
      _sum: { amount: true },
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Monthly report
router.get("/monthly", auth, async (req, res) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT DATE_TRUNC('month', "date") AS month,
             SUM(amount)::float          AS total
      FROM   "Transaction"
      WHERE  "userId" = ${req.user.userId}
      GROUP  BY month
      ORDER  BY month ASC
    `;
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Export CSV
router.get("/export", auth, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.userId },
      include: { category: true },
      orderBy: { date: "desc" },
    });
    const rows   = transactions.map(t => ({
      id: t.id, amount: t.amount, type: t.type,
      category: t.category?.name || "", date: new Date(t.date).toLocaleDateString(),
    }));
    const parser = new Parser({ fields: ["id", "amount", "type", "category", "date"] });
    const csv    = parser.parse(rows);
    res.header("Content-Type", "text/csv");
    res.attachment("transactions.csv");
    res.send(csv);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
