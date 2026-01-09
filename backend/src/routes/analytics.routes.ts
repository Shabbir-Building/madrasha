import { Router } from "express";

import {
  getOverviewStats,
  getIncomeExpenseComparison,
  getDonationsByMonth,
  getReportOverview,
  getIncomeReport,
  getExpenseReport,
  getDonationReport,
} from "../controllers/analytics.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/overview-stats", asyncHandler(getOverviewStats));

router.get(
  "/income-expense-comparison",
  asyncHandler(getIncomeExpenseComparison)
);

router.get("/donations-by-month", asyncHandler(getDonationsByMonth));

router.get("/report-overview", asyncHandler(getReportOverview));

router.get("/income-report", asyncHandler(getIncomeReport));

router.get("/expense-report", asyncHandler(getExpenseReport));

router.get("/donation-report", asyncHandler(getDonationReport));

export default router;
