// routes/taxRoutes.js
import express from "express";
import {
  getCountries,
  getStatesByCountry,
  calculateTax,
  getTaxHistory,
  getTaxCalendar
} from "../controllers/taxController.js";

const router = express.Router();

// Country & State APIs
router.get("/countries", getCountries);
router.get("/states/:countryCode", getStatesByCountry);

// Tax APIs
router.post("/calculate", calculateTax);
router.get("/history", getTaxHistory);
router.get("/calendar", getTaxCalendar);

export default router;
