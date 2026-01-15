'use client';

import { type AdminProfile, AdminRole } from '@/domain/admins';
import { type BranchLabel } from '@/domain/branches/constants';
import { Branch } from '@/domain/branches/enums';
import { BRANCH_LABELS } from '@/domain/branches/lib/labels';
import {
  EXPENSE_TYPE_MAP,
  EXPENSE_TYPE_REVERSE_MAP,
  type ExpenseTypeLabel,
} from '@/domain/expenses/constants';
import { updateExpense } from '@/services/expense';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import type React from 'react';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { Expense } from './ExpenseListTable';

const branchOptions: BranchLabel[] = ['Boys', 'Girls'];
const expenseTypeOptions: ExpenseTypeLabel[] = [
  'Salary',
  'Hostel',
  'Electricity Bill',
  'Mobile & Internet Bill',
  'Office',
  'Stationery',
  'Utilities',
  'Fare',
  'Maintenance',
  'Construction',
];

const expenseSchema = z.object({
  branch: z.number().min(1, 'Please select a branch'),
  type: z
    .string()
    .min(1, 'Please select an expense type')
    .refine((val) => expenseTypeOptions.includes(val as ExpenseTypeLabel), {
      message: 'Please select a valid expense type',
    }),
  notes: z.string().min(1, 'Notes are required').max(255, 'Notes too long'),
  expense_date: z.string().min(1, 'Date is required'),
  amount: z
    .number({ message: 'Amount must be a number' })
    .min(0.01, 'Amount must be greater than 0')
    .refine((val) => val > 0, 'Amount cannot be 0 or empty'),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface EditExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  admin?: AdminProfile;
}

export function EditExpenseModal({ open, onOpenChange, expense, admin }: EditExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const isSuperAdmin = admin?.role === AdminRole.SUPER_ADMIN;
  const canAccessBoys = isSuperAdmin || admin?.permissions?.access_boys_section;
  const canAccessGirls = isSuperAdmin || admin?.permissions?.access_girls_section;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      branch: 0,
      type: '',
      notes: '',
      expense_date: '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (expense) {
      const typeLabel = EXPENSE_TYPE_MAP[expense.type as keyof typeof EXPENSE_TYPE_MAP];

      reset({
        branch: expense.branch,
        type: typeLabel,
        notes: expense.notes,
        expense_date: expense.expense_date.split('T')[0],
        amount: expense.amount,
      });
    }
  }, [expense, reset]);

  const onSubmit = async (data: ExpenseFormData) => {
    if (!expense) return;

    setIsSubmitting(true);
    try {
      const typeValue = EXPENSE_TYPE_REVERSE_MAP[data.type as ExpenseTypeLabel];

      await updateExpense(
        expense._id,
        {
          branch: data.branch,
          type: typeValue,
          amount: data.amount,
          expense_date: data.expense_date,
          notes: data.notes,
        },
        {
          accessToken: session?.accessToken,
        },
      );

      toast.success('Expense updated successfully');
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Branch and Type Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}
                    onValueChange={(val) => field.onChange(Number.parseInt(val))}
                  >
                    <SelectTrigger className={errors.branch ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {canAccessBoys && (
                        <SelectItem value={String(Branch.BOYS)}>
                          {BRANCH_LABELS[Branch.BOYS]}
                        </SelectItem>
                      )}
                      {canAccessGirls && (
                        <SelectItem value={String(Branch.GIRLS)}>
                          {BRANCH_LABELS[Branch.GIRLS]}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branch && <p className="text-sm text-red-500">{errors.branch.message}</p>}
            </div>

            {/* Expense Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypeOptions.map((expenseType) => (
                        <SelectItem key={expenseType} value={expenseType}>
                          {expenseType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              {...register('amount', { valueAsNumber: true })}
              className={errors.amount ? 'border-red-500' : ''}
              min="0.01"
              step="0.01"
            />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="expense_date">Date</Label>
            <Input
              id="expense_date"
              type="date"
              {...register('expense_date')}
              className={errors.expense_date ? 'border-red-500' : ''}
            />
            {errors.expense_date && (
              <p className="text-sm text-red-500">{errors.expense_date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              placeholder="Enter notes or description"
              {...register('notes')}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.notes ? 'border-red-500' : ''
              }`}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
