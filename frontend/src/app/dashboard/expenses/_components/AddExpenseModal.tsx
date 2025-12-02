'use client';

import { BRANCH_LABELS } from '@/domain/branches/lib/labels';
import { EXPENSE_TYPE_REVERSE_MAP, type ExpenseTypeLabel } from '@/domain/expenses/constants';
import { getTodayDate } from '@/lib/date-utils';
import { createExpense } from '@/services/expense';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import type React from 'react';
import { useState } from 'react';

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

// Zod validation schema
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

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddExpenseModal({ open, onOpenChange }: AddExpenseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const createDefaultValues = (): ExpenseFormData => ({
    branch: 0,
    type: '',
    notes: '',
    expense_date: getTodayDate(),
    amount: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: createDefaultValues(),
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const typeValue = EXPENSE_TYPE_REVERSE_MAP[data.type as ExpenseTypeLabel];
      console.log(data);
      await createExpense(
        {
          branch: data.branch,
          type: typeValue,
          amount: data.amount,
          expense_date: data.expense_date,
          notes: data.notes,
        },
        {
          accessToken: (session as typeof session & { accessToken?: string })?.accessToken,
        },
      );

      toast.success('Expense added successfully');
      onOpenChange(false);
      reset(createDefaultValues());
      router.refresh();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset(createDefaultValues());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Expense</DialogTitle>
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
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BRANCH_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
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
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
