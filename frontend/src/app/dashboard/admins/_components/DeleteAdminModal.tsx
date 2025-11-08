'use client';

import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Admin } from './AdminListTable';

interface DeleteAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: Admin | null;
  onConfirm?: (admin: Admin) => void;
}

export function DeleteAdminModal({ open, onOpenChange, admin, onConfirm }: DeleteAdminModalProps) {
  if (!admin) return null;

  const initials = admin.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <ConfirmDeleteModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Admin"
      description="Are you sure you want to remove this admin? This action cannot be undone."
      confirmLabel="Delete Admin"
      onConfirm={() => onConfirm?.(admin)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={admin.avatar || '/placeholder.svg'} alt={admin.name} />
          <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{admin.name}</div>
          <div className="text-sm text-muted-foreground">{admin.type}</div>
        </div>
      </div>
    </ConfirmDeleteModal>
  );
}
