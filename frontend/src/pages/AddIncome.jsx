import "./AddIncome.css";
import { useState } from "react";

export default function AddIncome() {
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
    notes: ""
  });
  const [error, setError] = useState(""); // ✅ error state

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const save = (e) => {
    e.preventDefault();

    // ✅ validation
    if (!form.description || !form.amount || !form.category || !form.date) {
      setError("⚠️ Please fill all required fields");
      return;
    }

    setError("");

    // TODO: call API to save income
    alert("✅ Income saved successfully!");
  };

  return (
    <div className="income-wrap">
      <div className="panel glass">
        <h1 className="panel-title">Record New Income</h1>
        <p className="panel-sub">Track your Income..!</p>

        {/* ✅ show error */}
        {error && <p className="error">{error}</p>}

        <form onSubmit={save} className="panel-form">
          <input
            className="input"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={onChange}
          />
          <input
            className="input"
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={onChange}
          />
          <input
            className="input"
            name="category"
            placeholder="Category"
            value={form.category}
            onChange={onChange}
          />
          <input
            className="input"
            name="date"
            type="date"
            placeholder="Date"
            value={form.date}
            onChange={onChange}
          />
          <textarea
            className="input"
            rows="4"
            name="notes"
            placeholder="Notes (Optional)"
            value={form.notes}
            onChange={onChange}
          />
          <div className="row-gap">
            <button type="button" className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn btn-gradient">
              Save
            </button>
          </div>
        </form>
      </div>

      <div className="blob income-blob-1" />
      <div className="blob income-blob-2" />
    </div>
  );
}
