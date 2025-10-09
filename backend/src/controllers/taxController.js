// controllers/taxController.js
import fs from "fs";
import path from "path";
import TaxRecord from "../models/taxModel.js";

// ✅ Countries & States placeholder (CSV loading removed)
let countries = [];
let states = [];

// ✅ Fetch all countries
export const getCountries = (req, res) => {
  res.json(countries);
};

// ✅ Fetch states by country
export const getStatesByCountry = (req, res) => {
  const { countryCode } = req.params;
  const filteredStates = states.filter(
    (state) => state.country_code === countryCode
  );
  res.json(filteredStates);
};

// ✅ Calculate Estimated Tax (replace active record for same quarter)
export const calculateTax = async (req, res) => {
  try {
    const {
      country,
      state,
      filingStatus,
      quarter,
      income,
      expenses,
      retirement,
      insurance,
      homeOffice,
    } = req.body;

    if (!income || !quarter || !country || !state || !filingStatus) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 💡 Simple Tax Formula
    const taxableIncome =
      income - (Number(expenses) + Number(retirement) + Number(insurance) + Number(homeOffice));

    let taxRate = filingStatus === "married" ? 0.18 : 0.22;
    let estimatedTax = taxableIncome * taxRate;
    if (estimatedTax < 0) estimatedTax = 0;

    // ✅ Archive any existing active record for this quarter
    await TaxRecord.updateMany(
      { country, state, filingStatus, quarter, status: "active" },
      { $set: { status: "archived" } }
    );

    // ✅ Save new record as active
    const newRecord = new TaxRecord({
      country,
      state,
      filingStatus,
      quarter,
      income,
      expenses,
      retirement,
      insurance,
      homeOffice,
      estimatedTax,
      status: "active",
    });

    await newRecord.save();

    res.json({
      message: "Tax calculated successfully",
      taxableIncome,
      estimatedTax,
      record: newRecord,
    });
  } catch (err) {
    console.error("❌ Tax save error:", err);
    res.status(500).json({ message: "Error calculating tax", error: err });
  }
};

// ✅ Fetch Tax Records (History: includes archived + active)
export const getTaxHistory = async (req, res) => {
  try {
    const records = await TaxRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err });
  }
};

// ✅ Return Real-Time Tax Calendar Events (only active records)
export const getTaxCalendar = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Only active records
    const records = await TaxRecord.find({
      status: "active",
      createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) },
    });

    const quartersWithRecords = new Map();
    records.forEach((record) => {
      quartersWithRecords.set(record.quarter, record);
    });

    const events = [];

    const addQuarterEvents = (q, month, day, titleSuffix) => {
      if (quartersWithRecords.has(q)) {
        const record = quartersWithRecords.get(q);
        events.push(
          {
            type: "reminder",
            title: `Reminder: ${q} Estimated Tax Payment`,
            date: `${currentYear}-${month}-01`,
            description: `Reminder for ${q} estimated tax payment due on ${month}-${day}, ${currentYear}`,
          },
          {
            type: "payment",
            title: `${q} Estimated Tax Payment`,
            date: `${currentYear}-${month}-${day}`,
            description: `${q} estimated tax payment due`,
            amount: record.estimatedTax,
          }
        );
      }
    };

    addQuarterEvents("Q1", "03", "15");
    addQuarterEvents("Q2", "06", "15");
    addQuarterEvents("Q3", "09", "15");
    addQuarterEvents("Q4", "12", "15");

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tax calendar", error: err });
  }
};
