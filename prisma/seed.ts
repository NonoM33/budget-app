import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.expense.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.recurringExpense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash("Budget2026!", 12);

  const renaud = await prisma.user.create({
    data: {
      name: "Renaud",
      email: "renaud@budget.app",
      password: hashedPassword,
    },
  });

  const copine = await prisma.user.create({
    data: {
      name: "Copine",
      email: "copine@budget.app",
      password: hashedPassword,
    },
  });

  console.log("✅ Users created");

  // Create categories
  const categoriesData = [
    { name: "Loyer", icon: "Home", color: "#6366f1", order: 0 },
    { name: "Courses", icon: "ShoppingCart", color: "#22c55e", order: 1 },
    { name: "Transport", icon: "Car", color: "#f59e0b", order: 2 },
    { name: "Restaurants", icon: "UtensilsCrossed", color: "#ef4444", order: 3 },
    { name: "Loisirs", icon: "Gamepad2", color: "#8b5cf6", order: 4 },
    { name: "Santé", icon: "Heart", color: "#06b6d4", order: 5 },
    { name: "Abonnements", icon: "Smartphone", color: "#ec4899", order: 6 },
    { name: "Autres", icon: "Package", color: "#6b7280", order: 7 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.name] = created.id;
  }

  console.log("✅ Categories created");

  // Create recurring expenses
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  await prisma.recurringExpense.createMany({
    data: [
      {
        amount: 850,
        description: "Loyer",
        frequency: "monthly",
        nextDate: nextMonth,
        active: true,
        shared: true,
        categoryId: categories["Loyer"],
        userId: renaud.id,
      },
      {
        amount: 15.49,
        description: "Netflix",
        frequency: "monthly",
        nextDate: nextMonth,
        active: true,
        shared: true,
        categoryId: categories["Abonnements"],
        userId: renaud.id,
      },
      {
        amount: 10.99,
        description: "Spotify",
        frequency: "monthly",
        nextDate: nextMonth,
        active: true,
        shared: false,
        categoryId: categories["Abonnements"],
        userId: renaud.id,
      },
      {
        amount: 35,
        description: "Salle de sport",
        frequency: "monthly",
        nextDate: nextMonth,
        active: true,
        shared: false,
        categoryId: categories["Loisirs"],
        userId: copine.id,
      },
    ],
  });

  console.log("✅ Recurring expenses created");

  // Create budgets for current month
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgetsData = [
    { categoryName: "Loyer", amount: 850 },
    { categoryName: "Courses", amount: 400 },
    { categoryName: "Transport", amount: 150 },
    { categoryName: "Restaurants", amount: 200 },
    { categoryName: "Loisirs", amount: 150 },
    { categoryName: "Santé", amount: 80 },
    { categoryName: "Abonnements", amount: 60 },
    { categoryName: "Autres", amount: 100 },
  ];

  for (const b of budgetsData) {
    await prisma.budget.create({
      data: {
        amount: b.amount,
        month: currentMonth,
        year: currentYear,
        categoryId: categories[b.categoryName],
        userId: renaud.id,
      },
    });
  }

  console.log("✅ Budgets created");

  // Create sample expenses
  const expensesData = [
    {
      amount: 850,
      description: "Loyer juillet",
      categoryName: "Loyer",
      daysAgo: 25,
      shared: true,
      userId: renaud.id,
    },
    {
      amount: 87.32,
      description: "Carrefour",
      categoryName: "Courses",
      daysAgo: 2,
      shared: true,
      userId: copine.id,
    },
    {
      amount: 45.5,
      description: "Monoprix",
      categoryName: "Courses",
      daysAgo: 6,
      shared: true,
      userId: renaud.id,
    },
    {
      amount: 62.0,
      description: "Picard",
      categoryName: "Courses",
      daysAgo: 12,
      shared: true,
      userId: renaud.id,
    },
    {
      amount: 35.0,
      description: "Restaurant italien",
      categoryName: "Restaurants",
      daysAgo: 3,
      shared: true,
      userId: renaud.id,
    },
    {
      amount: 22.5,
      description: "Sushi emporter",
      categoryName: "Restaurants",
      daysAgo: 8,
      shared: false,
      userId: copine.id,
    },
    {
      amount: 75.0,
      description: "Navigo mensuel",
      categoryName: "Transport",
      daysAgo: 20,
      shared: false,
      userId: renaud.id,
    },
    {
      amount: 15.49,
      description: "Netflix",
      categoryName: "Abonnements",
      daysAgo: 15,
      shared: true,
      userId: renaud.id,
    },
    {
      amount: 29.9,
      description: "Cinéma x2",
      categoryName: "Loisirs",
      daysAgo: 5,
      shared: true,
      userId: copine.id,
    },
    {
      amount: 18.0,
      description: "Pharmacie",
      categoryName: "Santé",
      daysAgo: 7,
      shared: false,
      userId: copine.id,
    },
  ];

  for (const exp of expensesData) {
    const date = new Date();
    date.setDate(date.getDate() - exp.daysAgo);

    await prisma.expense.create({
      data: {
        amount: exp.amount,
        description: exp.description,
        date,
        shared: exp.shared,
        categoryId: categories[exp.categoryName],
        userId: exp.userId,
      },
    });
  }

  console.log("✅ Expenses created");

  // Create wishlist items
  await prisma.wishlistItem.createMany({
    data: [
      {
        name: "AirPods Pro 2",
        price: 279.0,
        url: "https://www.apple.com/fr/airpods-pro/",
        priority: 5,
        purchased: false,
        userId: renaud.id,
      },
      {
        name: "Robot pâtissier KitchenAid",
        price: 449.0,
        url: "https://www.kitchenaid.fr",
        priority: 4,
        purchased: false,
        userId: copine.id,
      },
      {
        name: "Week-end à Barcelone",
        price: 350.0,
        priority: 3,
        purchased: false,
        userId: renaud.id,
      },
    ],
  });

  console.log("✅ Wishlist items created");
  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
