import { Router } from "express";

import {
  getOverviewStats,
  getIncomeExpenseComparison,
  getDonationsByMonth,
  getReportOverview,
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

export default router;
