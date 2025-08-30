import React from "react";

export default function ExpensePage() {
  return (
    <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Gradient background circles */}
      <div className="absolute top-10 left-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-900 to-purple-600 blur-3xl opacity-70"></div>
      <div className="absolute bottom-10 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-blue-900 to-purple-700 blur-3xl opacity-70"></div>

      {/* Expense Form Card */}
      <div className="relative z-10 bg-black bg-opacity-40 border border-gray-700 rounded-2xl p-8 w-[400px] shadow-lg backdrop-blur-lg">
        <h2 className="text-white text-2xl font-bold mb-2">Record New Expense</h2>
        <p className="text-gray-400 text-sm mb-6">Track your Spending..!</p>

        {/* Form Inputs */}
        <form className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Description"
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="number"
            placeholder="Amount"
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="text"
            placeholder="Category"
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <input
            type="date"
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <textarea
            placeholder="Notes (Optional)"
            rows="3"
            className="w-full px-4 py-2 rounded-md border border-gray-600 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
          ></textarea>

          {/* Buttons */}
          <div className="flex flex-col space-y-3 mt-4">
            <button
              type="button"
              className="w-full py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full py-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
