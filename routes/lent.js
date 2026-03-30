const express = require("express");
const router  = express.Router();
const prisma  = require("../utils/prisma");
const auth    = require("../middleware/authMiddleware");

// GET all lent money records
router.get("/", auth, async (req, res) => {
  try {
    const records = await prisma.lentMoney.findMany({
      where: { userId: req.user.userId },
      orderBy: { date: "desc" },
    });
    res.json(records);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ADD lent money
router.post("/", auth, async (req, res) => {
  try {
    const { person, amount, date, note } = req.body;
    if (!person || !amount)
      return res.status(400).json({ message: "Person name and amount are required." });

    const record = await prisma.lentMoney.create({
      data: {
        person,
        amount: parseFloat(amount),
        date:   date ? new Date(date) : new Date(),
        note:   note || null,
        status: "pending",
        userId: req.user.userId,
      },
    });
    res.json(record);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// MARK as returned
router.patch("/:id/returned", auth, async (req, res) => {
  try {
    const id     = parseInt(req.params.id);
    const record = await prisma.lentMoney.findUnique({ where: { id } });
    if (!record || record.userId !== req.user.userId)
      return res.status(403).json({ message: "Not allowed." });

    const updated = await prisma.lentMoney.update({
      where: { id },
      data:  { status: "returned" },
    });
    res.json(updated);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// DELETE lent record
router.delete("/:id", auth, async (req, res) => {
  try {
    const id     = parseInt(req.params.id);
    const record = await prisma.lentMoney.findUnique({ where: { id } });
    if (!record || record.userId !== req.user.userId)
      return res.status(403).json({ message: "Not allowed." });

    await prisma.lentMoney.delete({ where: { id } });
    res.json({ message: "Record deleted." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
