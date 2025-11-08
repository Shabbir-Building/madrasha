import { Router } from "express";

import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
} from "../controllers/income.controller";
import { validate } from "../middlewares/validation/validate";
import {
  createIncomeSchema,
  updateIncomeSchema,
} from "../middlewares/validation/schemas/income.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getIncomes));

router.get("/:id", asyncHandler(getIncomeById));

router.post(
  "/create-income",
  validate(createIncomeSchema),
  asyncHandler(createIncome)
);

router.put("/:id", validate(updateIncomeSchema), asyncHandler(updateIncome));

router.delete("/:id", asyncHandler(deleteIncome));

export default router;
