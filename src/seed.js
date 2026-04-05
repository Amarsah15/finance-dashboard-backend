import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.model.js";
import Record from "./models/Record.model.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Clear existing data
    await User.deleteMany();
    await Record.deleteMany();
    console.log("🗑️  Cleared existing database");

    // 2. Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash("password123", salt);

    const admin = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password,
      role: "Admin",
    });
    const analyst = await User.create({
      name: "Analyst User",
      email: "analyst@test.com",
      password,
      role: "Analyst",
    });
    const viewer = await User.create({
      name: "Viewer User",
      email: "viewer@test.com",
      password,
      role: "Viewer",
    });

    console.log(
      "👥 Created Admin, Analyst, and Viewer users (Password: password123)",
    );

    // 3. Create Sample Records for Admin
    const records = [];
    const categories = [
      "Salary",
      "Groceries",
      "Rent",
      "Freelance",
      "Utilities",
    ];

    for (let i = 0; i < 20; i++) {
      const isIncome = i % 3 === 0; // 1/3 are income
      records.push({
        user: admin._id,
        amount: Math.floor(Math.random() * 1000) + 50,
        type: isIncome ? "income" : "expense",
        category: categories[Math.floor(Math.random() * categories.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random dates in the past
        notes: "Auto-generated seed record",
      });
    }

    await Record.insertMany(records);
    console.log("📈 Created 20 sample financial records");

    console.log("🎉 Seeding Complete! You can now start the server.");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();
