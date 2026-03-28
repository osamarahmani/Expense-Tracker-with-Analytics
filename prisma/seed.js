const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Expense categories
  const expenseCategories = ["Food", "Travel", "Shopping", "Bills", "Health", "Education", "Entertainment", "Other"];
  for (const name of expenseCategories) {
    await prisma.category.upsert({
      where: { id: expenseCategories.indexOf(name) + 1 },
      update: {},
      create: { name, type: "expense" },
    });
  }

  // Income categories
  const incomeCategories = ["Salary", "Gift", "Investment", "Freelance", "Business", "Others"];
  for (let i = 0; i < incomeCategories.length; i++) {
    await prisma.category.upsert({
      where: { id: expenseCategories.length + i + 1 },
      update: {},
      create: { name: incomeCategories[i], type: "income" },
    });
  }

  console.log("✅ Categories created");

  // Admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: { name: "Admin", email: "admin@gmail.com", password: hashedPassword, role: "ADMIN" },
  });

  console.log("✅ Admin user → Email: admin@gmail.com | Password: admin123");
  console.log("🚀 Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
