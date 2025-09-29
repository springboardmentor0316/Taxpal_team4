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

// ✅ Calculate Estimated Tax (Avoid duplicates)
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

    console.log("📥 Tax API request body:", req.body);

    if (!income || !quarter || !country || !state || !filingStatus) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 💡 Simple Tax Formula
    const taxableIncome =
      income -
      (Number(expenses) +
        Number(retirement) +
        Number(insurance) +
        Number(homeOffice));

    let taxRate = filingStatus === "married" ? 0.18 : 0.22;
    let estimatedTax = taxableIncome * taxRate;
    if (estimatedTax < 0) estimatedTax = 0;

    // ✅ Check for duplicate record
    const existing = await TaxRecord.findOne({
      country,
      state,
      filingStatus,
      quarter,
      income,
      expenses,
      retirement,
      insurance,
      homeOffice,
    });

    if (existing) {
      console.log("⚠️ Duplicate record skipped.");
      return res.json({
        message: "Tax already calculated for these details",
        taxableIncome,
        estimatedTax,
        record: existing,
      });
    }

    // ✅ Save record in DB if not duplicate
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

// ✅ Fetch Tax Records (History)
export const getTaxHistory = async (req, res) => {
  try {
    const records = await TaxRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err });
  }
};

// ✅ Return Real-Time Tax Calendar Events (with amounts)
export const getTaxCalendar = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    const records = await TaxRecord.find({
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
    });

    // Map each quarter to its record
    const quartersWithRecords = new Map();
    records.forEach((record) => {
      quartersWithRecords.set(record.quarter, record);
    });

    const events = [];

    if (quartersWithRecords.has("Q1")) {
      const record = quartersWithRecords.get("Q1");
      events.push(
        {
          type: "reminder",
          title: "Reminder: Q1 Estimated Tax Payment",
          date: `${currentYear}-03-01`,
          description: `Reminder for Q1 estimated tax payment due on Mar 15, ${currentYear}`,
        },
        {
          type: "payment",
          title: "Q1 Estimated Tax Payment",
          date: `${currentYear}-03-15`,
          description: "First quarter estimated tax payment due",
          amount: record.estimatedTax, // ✅ Added
        }
      );
    }

    if (quartersWithRecords.has("Q2")) {
      const record = quartersWithRecords.get("Q2");
      events.push(
        {
          type: "reminder",
          title: "Reminder: Q2 Estimated Tax Payment",
          date: `${currentYear}-06-01`,
          description: `Reminder for Q2 estimated tax payment due on Jun 15, ${currentYear}`,
        },
        {
          type: "payment",
          title: "Q2 Estimated Tax Payment",
          date: `${currentYear}-06-15`,
          description: "Second quarter estimated tax payment due",
          amount: record.estimatedTax, // ✅ Added
        }
      );
    }

    if (quartersWithRecords.has("Q3")) {
      const record = quartersWithRecords.get("Q3");
      events.push(
        {
          type: "reminder",
          title: "Reminder: Q3 Estimated Tax Payment",
          date: `${currentYear}-09-01`,
          description: `Reminder for Q3 estimated tax payment due on Sep 15, ${currentYear}`,
        },
        {
          type: "payment",
          title: "Q3 Estimated Tax Payment",
          date: `${currentYear}-09-15`,
          description: "Third quarter estimated tax payment due",
          amount: record.estimatedTax, // ✅ Added
        }
      );
    }

    if (quartersWithRecords.has("Q4")) {
      const record = quartersWithRecords.get("Q4");
      events.push(
        {
          type: "reminder",
          title: "Reminder: Q4 Estimated Tax Payment",
          date: `${currentYear}-12-01`,
          description: `Reminder for Q4 estimated tax payment due on Jan 15, ${
            currentYear + 1
          }`,
        },
        {
          type: "payment",
          title: "Q4 Estimated Tax Payment",
          date: `${currentYear}-12-15`,
          description: "Fourth quarter estimated tax payment due",
          amount: record.estimatedTax, // ✅ Added
        }
      );
    }

    res.json(events);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch tax calendar", error: err });
  }
};
