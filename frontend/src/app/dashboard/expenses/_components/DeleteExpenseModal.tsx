'use client';

import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { BRANCH_REVERSE_MAP, type BranchLabel } from '@/domain/branches/constants';
import { EXPENSE_TYPE_MAP } from '@/domain/expenses/constants';
import type { Expense } from '@/services/expense/types';

type DeleteExpenseModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onConfirm?: (expense: Expense) => void;
  confirmLoading?: boolean;
};

const getBranchLabel = (branch: number): BranchLabel | 'Unknown' => {
  const entry = (Object.entries(BRANCH_REVERSE_MAP) as [BranchLabel, number][]).find(
    ([, value]) => value === branch,
  );
  return entry?.[0] ?? 'Unknown';
};

export function DeleteExpenseModal({
  open,
  onOpenChange,
  expense,
  onConfirm,
  confirmLoading = false,
}: DeleteExpenseModalProps) {
  if (!expense) return null;

  const branchLabel = getBranchLabel(expense.branch);
  const expenseType =
    EXPENSE_TYPE_MAP[expense.type as keyof typeof EXPENSE_TYPE_MAP] ?? 'Unknown';

  return (
    <ConfirmDeleteModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Expense"
      description="Are you sure you want to delete this expense record? This action cannot be undone."
      confirmLabel="Delete Expense"
      confirmLoading={confirmLoading}
      onConfirm={() => onConfirm?.(expense)}
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">Type</span>
          <span>{expenseType}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Branch</span>
          <span>{branchLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Amount</span>
          <span>৳{expense.amount.toLocaleString()}</span>
        </div>
        <div className="rounded-md bg-muted/50 p-3 text-left">
          <div className="text-xs uppercase text-muted-foreground">Notes</div>
          <div className="text-sm">{expense.notes || 'No notes provided'}</div>
        </div>
      </div>
    </ConfirmDeleteModal>
  );
}


