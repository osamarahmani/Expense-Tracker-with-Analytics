const express = require("express");
const router  = express.Router();
const prisma  = require("../utils/prisma");
const auth    = require("../middleware/authMiddleware");

// GET all categories
router.get("/", auth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
    res.json(categories);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// GET categories by type (income or expense)
router.get("/:type", auth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { type: req.params.type },
      orderBy: { id: "asc" },
    });
    res.json(categories);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
