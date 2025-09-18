// src/controllers/dashboardController.js
import Transaction from "../models/transactionModel.js";
import Category from "../models/categoryModel.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // totals
    const agg = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let incomeTotal = 0, expenseTotal = 0;
    agg.forEach(a => {
      if (a._id === "income") incomeTotal = a.total;
      if (a._id === "expense") expenseTotal = a.total;
    });

    // recent transactions
    const recent = await Transaction.find({ user: userId }).sort({ date: -1 }).limit(8);

    // pie data: sum by category for expenses
    const pieAgg = await Transaction.aggregate([
      { $match: { user: userId, type: "expense" } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);

    // categories (both types) for dropdown
    const categories = await Category.find().sort({ name: 1 });

    res.json({
      totals: { income: incomeTotal || 0, expense: expenseTotal || 0, savings: (incomeTotal - expenseTotal) || 0 },
      recent,
      pie: pieAgg,
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error dashboard" });
  }
};
