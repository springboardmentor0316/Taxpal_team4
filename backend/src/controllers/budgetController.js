// src/controllers/budgetController.js
import Budget from "../models/budgetModel.js";
import Transaction from "../models/transactionModel.js"; // ensure this model exists

// Helper: recalc and persist spent for a single budget (month/year scoped)
const recalcSpent = async (budget) => {
  // ensure budget.date exists and is a Date object
  const dateObj = budget.date ? new Date(budget.date) : new Date();
  const start = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
  const end = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);

  const txs = await Transaction.find({
    user: budget.user,
    category: budget.category,
    type: "expense",
    date: { $gte: start, $lte: end },
  });

  budget.spent = txs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // persist the updated spent value
  await budget.save();

  return budget;
};

/**
 * GET /api/budgets
 * Return budgets for the user; recalc spent for each before returning
 */
export const getBudgets = async (req, res) => {
  try {
    let budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Recalculate spent for each budget (async in parallel)
    budgets = await Promise.all(budgets.map(async (b) => await recalcSpent(b)));

    res.json({ budgets });
  } catch (err) {
    console.error("getBudgets error:", err);
    res.status(500).json({ message: "Server error fetching budgets" });
  }
};

/**
 * POST /api/budgets
 * Create a new budget and calculate spent
 */
export const createBudget = async (req, res) => {
  try {
    const { category, amount, date, description } = req.body;
    if (!category || amount === undefined) {
      return res.status(400).json({ message: "category and amount are required" });
    }

    let budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      date: date ? new Date(date) : new Date(),
      description,
    });

    // calculate spent for the created budget and persist
    budget = await recalcSpent(budget);

    res.status(201).json({ message: "Budget created", budget });
  } catch (err) {
    console.error("createBudget error:", err);
    res.status(500).json({ message: "Server error creating budget" });
  }
};

/**
 * PUT /api/budgets/:id
 * Update budget fields and recalc spent
 */
export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    let budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    if (budget.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { category, amount, date, description, spent } = req.body;
    if (category !== undefined) budget.category = category;
    if (amount !== undefined) budget.amount = amount;
    if (date !== undefined) budget.date = new Date(date);
    if (description !== undefined) budget.description = description;
    // allow direct spent override only if provided (keeps backward compatibility)
    if (spent !== undefined) budget.spent = Number(spent) || 0;

    // Recalculate based on transactions to ensure consistency (this will save)
    budget = await recalcSpent(budget);

    res.json({ message: "Budget updated", budget });
  } catch (err) {
    console.error("updateBudget error:", err);
    res.status(500).json({ message: "Server error updating budget" });
  }
};

/**
 * DELETE /api/budgets/:id
 * Delete budget (owner only)
 */
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });
    if (budget.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // Use deleteOne to remove the budget (avoid deprecated .remove())
    await Budget.deleteOne({ _id: id });

    res.json({ message: "Budget removed" });
  } catch (err) {
    console.error("deleteBudget error:", err);
    res.status(500).json({ message: "Server error deleting budget" });
  }
};
