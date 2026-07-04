require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const app     = express();

const authRoutes        = require("./routes/auth");
const adminRoutes       = require("./routes/admin");
const transactionRoutes = require("./routes/transaction");
const reportRoutes      = require("./routes/report");
const categoryRoutes    = require("./routes/category");
const lentRoutes        = require("./routes/lent");

app.use(cors());
app.use(express.json());

app.use("/api/auth",         authRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports",      reportRoutes);
app.use("/api/categories",   categoryRoutes);
app.use("/api/lent",         lentRoutes);

app.get("/", (req, res) => res.send("✅ FinTrack API running on port 5000"));

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
