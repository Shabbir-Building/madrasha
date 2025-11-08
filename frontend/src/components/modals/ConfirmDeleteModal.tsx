import { AlertTriangle } from 'lucide-react';

import { type ReactNode } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type ConfirmDeleteModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
};

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
  icon,
  children,
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              {icon ?? <AlertTriangle className="h-6 w-6 text-destructive" />}
            </div>
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              {description ? (
                <AlertDialogDescription className="text-left">{description}</AlertDialogDescription>
              ) : null}
            </div>
          </div>
        </AlertDialogHeader>

        {children ? <div className="rounded-lg border p-4">{children}</div> : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={confirmLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (!confirmDisabled) {
                onConfirm?.();
              }
            }}
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={confirmDisabled}
          >
            {confirmLoading ? 'Deleting...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
