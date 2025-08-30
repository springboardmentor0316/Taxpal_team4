import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Home,
  DollarSign,
  CreditCard,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  Moon,
} from "lucide-react";

// Donut data (4 equal parts like your screenshot)
const donutData = [
  { name: "Investment", value: 25, color: "#8B5CF6" }, // purple
  { name: "Food",       value: 25, color: "#10B981" }, // green
  { name: "Shopping",   value: 25, color: "#3B82F6" }, // blue
  { name: "Others",     value: 25, color: "#F59E0B" }, // orange
];

// Earning Flow (two lines: teal + green)
const flowData = [
  { x: "01", a:  950, b:  800 },
  { x: "05", a: 1900, b: 1500 },
  { x: "10", a: 1400, b: 1200 },
  { x: "15", a: 2850, b: 2300 },
  { x: "20", a: 2200, b: 2100 },
  { x: "25", a: 3200, b: 3000 },
  { x: "30", a: 2600, b: 2450 },
  { x: "35", a: 3400, b: 3250 },
  { x: "40", a: 2400, b: 2200 },
];

export default function DashboardPage() {
  return (
    <div className="h-screen w-full flex bg-[#0f1126] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 bg-[#111235] flex flex-col items-center py-6 space-y-6">
        <Home className="text-gray-400 hover:text-white cursor-pointer" />
        <DollarSign className="text-gray-400 hover:text-white cursor-pointer" />
        <CreditCard className="text-gray-400 hover:text-white cursor-pointer" />
        <BarChart3 className="text-gray-400 hover:text-white cursor-pointer" />
        <Users className="text-gray-400 hover:text-white cursor-pointer" />
        <Settings className="text-gray-400 hover:text-white cursor-pointer mt-auto" />
        <LogOut className="text-gray-400 hover:text-white cursor-pointer" />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold">Dashboard Design</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="bg-[#1a1c3a] text-sm px-4 py-2 rounded-lg focus:outline-none"
              />
              <Search className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
            </div>
            <Moon className="cursor-pointer" />
            <Bell className="cursor-pointer" />
            <Settings className="cursor-pointer" />
          </div>
        </div>

        {/* Gradient Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[
            { title: "Estimated Tax Due", value: "$4,156.45", icon: <DollarSign /> },
            { title: "Monthly Income", value: "$3,146.45", icon: <DollarSign /> },
            { title: "Monthly Expenses", value: "$1,146.45", icon: <CreditCard /> },
            { title: "Savings", value: "$2,146.45", icon: <BarChart3 /> },
          ].map((card, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-4 bg-gradient-to-r from-[#e63946] to-[#d62a7d] flex justify-between items-center shadow-lg"
            >
              <div>
                <p className="text-sm">{card.title}</p>
                <h2 className="text-xl font-bold">{card.value}</h2>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">{card.icon}</div>
            </div>
          ))}
        </div>

        {/* Middle: Donut + Earning Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Donut (All Expenses) */}
          <div className="bg-[#1a1c3a] p-6 rounded-2xl shadow-lg">
            <h2 className="font-semibold mb-4">All Expenses</h2>
            <div className="flex items-center">
              <div className="relative w-[60%] h-64">
                {/* center label "100%" */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold">100%</span>
                </div>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}   // makes it a donut
                      outerRadius={85}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {donutData.map((seg, i) => (
                        <Cell key={i} fill={seg.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="ml-6 space-y-3 text-sm">
                {donutData.map((item, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Earning Flow (two smooth lines) */}
          <div className="bg-[#1a1c3a] p-6 rounded-2xl shadow-lg">
            <h2 className="font-semibold mb-4">Earning Flow</h2>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <LineChart
                  data={flowData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2b2e54" />
                  <XAxis dataKey="x" stroke="#9aa0c3" />
                  <YAxis stroke="#9aa0c3" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="a"
                    stroke="#22d3ee"         // teal
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#22d3ee" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="b"
                    stroke="#22c55e"         // green
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#22c55e" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom: Transactions + Card Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transaction */}
          <div className="bg-[#1a1c3a] p-6 rounded-2xl shadow-lg">
            <h2 className="font-semibold mb-4">Recent Transaction</h2>
            <div className="space-y-4">
              {[
                { name: "Rumi Aktar", date: "15 Nov 2013", img: "https://i.pravatar.cc/40?img=1" },
                { name: "Alamin Sarkar", date: "10 Oct 2013", img: "https://i.pravatar.cc/40?img=2" },
                { name: "Rasel Ahmed", date: "21 Sep 2013", img: "https://i.pravatar.cc/40?img=3" },
                { name: "Rumi Aktar", date: "15 Nov 2013", img: "https://i.pravatar.cc/40?img=4" },
              ].map((txn, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img src={txn.img} alt={txn.name} className="w-8 h-8 rounded-full" />
                    <span>{txn.name}</span>
                  </div>
                  <span className="text-sm text-gray-400">{txn.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Information */}
          <div className="bg-[#1a1c3a] p-6 rounded-2xl shadow-lg">
            <h2 className="font-semibold mb-4">Card Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Status</span><span className="text-green-400">Active</span></div>
              <div className="flex justify-between"><span>Card</span><span>Credit</span></div>
              <div className="flex justify-between"><span>Card Type</span><span>Visa</span></div>
              <div className="flex justify-between"><span>Card Number</span><span>223456****</span></div>
              <div className="flex justify-between"><span>Expire Date</span><span>12-12-2026</span></div>
              <div className="flex justify-between"><span>Currency</span><span>IND</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
