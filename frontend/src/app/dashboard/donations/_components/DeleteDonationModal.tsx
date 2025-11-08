'use client';

import { DONATION_TYPE_MAP } from '@/domain/donations/constants';
import type { Donation } from '@/services/donation/types';

import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';

type DeleteDonationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation | null;
  onConfirm?: (donation: Donation) => void;
  confirmLoading?: boolean;
};

export function DeleteDonationModal({
  open,
  onOpenChange,
  donation,
  onConfirm,
  confirmLoading = false,
}: DeleteDonationModalProps) {
  if (!donation) return null;

  const donationType =
    DONATION_TYPE_MAP[donation.donation_type as keyof typeof DONATION_TYPE_MAP] ?? 'Unknown';

  return (
    <ConfirmDeleteModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Donation"
      description="Are you sure you want to delete this donation record? This action cannot be undone."
      confirmLabel="Delete Donation"
      confirmLoading={confirmLoading}
      onConfirm={() => onConfirm?.(donation)}
    >
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium">Donor</span>
          <span>{donation.fullname}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Type</span>
          <span>{donationType}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Amount</span>
          <span>৳{donation.donation_amount.toLocaleString()}</span>
        </div>
        <div className="rounded-md bg-muted/50 p-3 text-left">
          <div className="text-xs uppercase text-muted-foreground">Notes</div>
          <div className="text-sm">{donation.notes || 'No notes provided'}</div>
        </div>
      </div>
    </ConfirmDeleteModal>
  );
}
