import Record from "../models/Record.model.js";
import mongoose from "mongoose";

// @desc    Get dashboard summary data
// @route   GET /api/v1/dashboard/summary
// @access  Private (All authenticated users)
export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // --- ADMIN SCOPE LOGIC ---
    // If Admin, match everything (empty object). If Viewer/Analyst, match only their own ID.
    const matchStage =
      req.user.role === "Admin"
        ? { isDeleted: false }
        : { user: userId, isDeleted: false };

    // 1. Calculate Total Income, Total Expenses, and Net Balance
    const summaryStats = await Record.aggregate([
      { $match: matchStage }, // Dynamic match applied here
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIncome: 1,
          totalExpense: 1,
          netBalance: { $subtract: ["$totalIncome", "$totalExpense"] },
        },
      },
    ]);

    // 2. Calculate Category-wise Totals
    const categoryTotals = await Record.aggregate([
      { $match: matchStage }, // Dynamic match applied here
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          type: "$_id.type",
          totalAmount: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // 3. Calculate Monthly Trends (Last 6 Months)
    const monthlyTrends = await Record.aggregate([
      { $match: matchStage }, // Dynamic match applied here
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] },
          },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          income: 1,
          expense: 1,
          net: { $subtract: ["$income", "$expense"] },
        },
      },
    ]);

    // 4. Fetch the 5 most recent transactions
    const recentActivity = await Record.find(matchStage) // Dynamic match applied here
      .populate("user", "name") // Helpful for Admins to see who made the transaction
      .sort({ date: -1 })
      .limit(5)
      .select("-__v -updatedAt");

    const stats =
      summaryStats.length > 0
        ? summaryStats[0]
        : { totalIncome: 0, totalExpense: 0, netBalance: 0 };

    res.status(200).json({
      success: true,
      data: {
        summary: stats,
        categories: categoryTotals,
        trends: monthlyTrends,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
