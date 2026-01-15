'use client';

import { type AdminProfile, AdminRole } from '@/domain/admins';
import { Branch } from '@/domain/branches/enums';
import { INCOME_TYPE_LABELS } from '@/domain/income';
import { updateIncome } from '@/services/income';
import type { Income } from '@/services/income/types';
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

const incomeSchema = z.object({
  branch: z.number().min(1, 'Please select a branch'),
  type: z.number().min(1, 'Please select an income type'),
  notes: z.string().min(1, 'Note is required').max(255, 'Note must be less than 255 characters'),
  income_date: z.string().min(1, 'Date is required'),
  amount: z
    .number({ message: 'Amount must be a number' })
    .min(1, 'Amount must be at least 1')
    .int('Amount must be an integer'),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface EditIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: Income | null;
  admin?: AdminProfile;
}

export function EditIncomeModal({ open, onOpenChange, income, admin }: EditIncomeModalProps) {
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
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      branch: 0,
      type: 0,
      notes: '',
      income_date: '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (income) {
      reset({
        branch: income.branch,
        type: income.type,
        notes: income.notes,
        income_date: income.income_date.split('T')[0],
        amount: income.amount,
      });
    }
  }, [income, reset]);

  const onSubmit = async (data: IncomeFormData) => {
    if (!income) return;

    setIsSubmitting(true);
    try {
      const { error } = await updateIncome(income._id, data, {
        accessToken: session?.accessToken,
      });

      if (error) {
        throw new Error(error.statusText || 'Failed to update income');
      }

      toast.success('Income updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating income:', error);
      toast.error('Failed to update income');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!income) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Income</DialogTitle>
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
                      {canAccessBoys && <SelectItem value={`${Branch.BOYS}`}>Boys</SelectItem>}
                      {canAccessGirls && <SelectItem value={`${Branch.GIRLS}`}>Girls</SelectItem>}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.branch && <p className="text-sm text-red-500">{errors.branch.message}</p>}
            </div>

            {/* Income Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value && field.value !== 0 ? field.value.toString() : undefined}
                    onValueChange={(val) => field.onChange(Number.parseInt(val))}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INCOME_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <textarea
              id="notes"
              placeholder="Enter note or description"
              {...register('notes')}
              className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.notes ? 'border-red-500' : ''
              }`}
            />
            {errors.notes && <p className="text-sm text-red-500">{errors.notes.message}</p>}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="income_date">Date</Label>
            <Input
              id="income_date"
              type="date"
              {...register('income_date')}
              className={errors.income_date ? 'border-red-500' : ''}
            />
            {errors.income_date && (
              <p className="text-sm text-red-500">{errors.income_date.message}</p>
            )}
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
              {isSubmitting ? 'Updating...' : 'Update Income'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
