'use client';

import { BRANCH_LABELS } from '@/domain/branches/lib/labels';
import { INCOME_TYPE_LABELS, IncomeType as IncomeTypeEnum } from '@/domain/income';
import type { Income } from '@/services/income/types';

import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';

type DeleteIncomeModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income | null;
  onConfirm?: (income: Income) => void;
  confirmLoading?: boolean;
};

const formatIncomeSummary = (income: Income) => {
  const typeLabel = INCOME_TYPE_LABELS[income.type as IncomeTypeEnum] ?? 'Unknown';
  const branchLabel = BRANCH_LABELS[income.branch as 1 | 2] ?? 'Unknown';
  return `${typeLabel} • ${branchLabel}`;
};

export function DeleteIncomeModal({
  open,
  onOpenChange,
  income,
  onConfirm,
  confirmLoading = false,
}: DeleteIncomeModalProps) {
  if (!income) return null;

  return (
    <ConfirmDeleteModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Income"
      description="Are you sure you want to delete this income record? This action cannot be undone."
      confirmLabel="Delete Income"
      confirmLoading={confirmLoading}
      onConfirm={() => onConfirm?.(income)}
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">Amount</span>
          <span>৳{income.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Details</span>
          <span>{formatIncomeSummary(income)}</span>
        </div>
        <div className="rounded-md bg-muted/50 p-3 text-left">
          <div className="text-xs uppercase text-muted-foreground">Notes</div>
          <div className="text-sm">{income.notes}</div>
        </div>
      </div>
    </ConfirmDeleteModal>
  );
}
