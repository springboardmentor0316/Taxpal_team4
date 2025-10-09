// src/controllers/transactionController.js
import Transaction from "../models/transactionModel.js";
import Budget from "../models/budgetModel.js";

// helper to recalc spent for a budget
const recalcSpent = async (budget) => {
  const start = new Date(budget.date.getFullYear(), budget.date.getMonth(), 1);
  const end = new Date(budget.date.getFullYear(), budget.date.getMonth() + 1, 0);

  const transactions = await Transaction.find({
    user: budget.user,
    category: budget.category,
    type: "expense",
    date: { $gte: start, $lte: end },
  });

  budget.spent = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  await budget.save();
  return budget;
};

/**
 * GET /api/transactions
 */
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(100);
    res.json({ transactions });
  } catch (err) {
    console.error("getTransactions error:", err);
    res.status(500).json({ message: "Server error fetching transactions" });
  }
};

/**
 * POST /api/transactions
 */
export const createTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, category, amount, date, note, description } = req.body;

    const tx = await Transaction.create({
      user: userId,
      type,
      category,
      amount,
      date: date ? new Date(date) : Date.now(),
      note,
      description, // <-- save description
    });

    // 🔄 update related budget spent if expense
    if (type === "expense") {
      const budget = await Budget.findOne({ user: userId, category });
      if (budget) await recalcSpent(budget);
    }

    res.status(201).json({ transaction: tx });
  } catch (err) {
    console.error("createTransaction error:", err);
    res.status(500).json({ message: "Server error creating transaction" });
  }
};

/**
 * PUT /api/transactions/:id
 */
export const updateTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { type, category, amount, date, note, description } = req.body;

    const tx = await Transaction.findOneAndUpdate(
      { _id: id, user: userId },
      { type, category, amount, date, note, description }, // <-- include description
      { new: true }
    );
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    // 🔄 update related budget spent if expense
    if (tx.type === "expense") {
      const budget = await Budget.findOne({ user: userId, category: tx.category });
      if (budget) await recalcSpent(budget);
    }

    res.json({ transaction: tx });
  } catch (err) {
    console.error("updateTransaction error:", err);
    res.status(500).json({ message: "Server error updating transaction" });
  }
};

/**
 * DELETE /api/transactions/:id
 */
export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const tx = await Transaction.findOneAndDelete({ _id: id, user: userId });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    // 🔄 update related budget spent if expense
    if (tx.type === "expense") {
      const budget = await Budget.findOne({ user: userId, category: tx.category });
      if (budget) await recalcSpent(budget);
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteTransaction error:", err);
    res.status(500).json({ message: "Server error deleting transaction" });
  }
};
