'use client';

import { BRANCH_MAP, BRANCH_REVERSE_MAP, type BranchLabel } from '@/domain/branches/constants';
import {
  DONATION_TYPE_MAP,
  DONATION_TYPE_REVERSE_MAP,
  type DonationTypeLabel,
} from '@/domain/donations/constants';
import { updateDonation } from '@/services/donation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
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

import type { Donation } from './DonationListTable';

const branchOptions: BranchLabel[] = ['Boys', 'Girls'];
const donationTypeOptions: DonationTypeLabel[] = ['Sadaqah', 'Zakat', 'Membership', 'Others'];

const donationSchema = z.object({
  branch: z
    .string()
    .min(1, 'Please select a branch')
    .refine((val) => branchOptions.includes(val as BranchLabel), {
      message: 'Please select a valid branch',
    }),
  fullname: z.string().min(1, 'Donor name is required').max(100, 'Name too long'),
  phone_number: z.string().min(1, 'Phone number is required').max(15, 'Phone number too long'),
  donation_type: z
    .string()
    .min(1, 'Please select a donation type')
    .refine((val) => donationTypeOptions.includes(val as DonationTypeLabel), {
      message: 'Please select a valid donation type',
    }),
  donation_date: z.string().min(1, 'Date is required'),
  donation_amount: z
    .number()
    .min(1, 'Amount must be greater than 0')
    .refine((val) => val > 0, 'Amount cannot be 0 or empty'),
  notes: z.string().max(255, 'Notes too long').optional(),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface EditDonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation | null;
}

export function EditDonationModal({ open, onOpenChange, donation }: EditDonationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      fullname: '',
      phone_number: '',
      donation_type: '',
      donation_date: '',
      donation_amount: 0,
      notes: '',
      branch: '',
    },
  });

  const watchedBranch = watch('branch');
  const watchedType = watch('donation_type');

  useEffect(() => {
    if (donation) {
      const branchLabel = BRANCH_MAP[donation.branch as keyof typeof BRANCH_MAP] ?? '';
      if (branchLabel && branchOptions.includes(branchLabel as BranchLabel)) {
        setValue('branch', branchLabel as BranchLabel);
      } else {
        setValue('branch', '');
      }
      setValue('fullname', donation.fullname);
      setValue('phone_number', donation.phone_number);
      const typeLabel = DONATION_TYPE_MAP[donation.donation_type as keyof typeof DONATION_TYPE_MAP];
      setValue('donation_type', typeLabel);
      setValue('donation_date', donation.donation_date.split('T')[0]);
      setValue('donation_amount', donation.donation_amount);
      setValue('notes', donation.notes || '');
    }
  }, [donation, setValue]);

  const onSubmit = async (data: DonationFormData) => {
    if (!donation) return;

    setIsSubmitting(true);
    try {
      const donationTypeValue = DONATION_TYPE_REVERSE_MAP[data.donation_type as DonationTypeLabel];
      const branchValue = BRANCH_REVERSE_MAP[data.branch as BranchLabel];

      await updateDonation(
        donation._id,
        {
          branch: branchValue,
          fullname: data.fullname,
          phone_number: data.phone_number,
          donation_type: donationTypeValue,
          donation_amount: data.donation_amount,
          donation_date: data.donation_date,
          notes: data.notes || undefined,
        },
        {
          accessToken: (session as typeof session & { accessToken?: string })?.accessToken,
        },
      );

      toast.success('Donation updated successfully');
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating donation:', error);
      toast.error('Failed to update donation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!donation) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Donation</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Branch */}
          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Select
              value={watchedBranch}
              onValueChange={(value) => {
                setValue('branch', value as BranchLabel);
                trigger('branch');
              }}
            >
              <SelectTrigger className={errors.branch ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branch && <p className="text-sm text-red-500">{errors.branch.message}</p>}
          </div>
          {/* Donor Name */}
          <div className="space-y-2">
            <Label htmlFor="fullname">Donor Name</Label>
            <Input
              id="fullname"
              placeholder="Enter donor name"
              {...register('fullname')}
              className={errors.fullname ? 'border-red-500' : ''}
            />
            {errors.fullname && <p className="text-sm text-red-500">{errors.fullname.message}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              placeholder="Enter phone number"
              {...register('phone_number')}
              className={errors.phone_number ? 'border-red-500' : ''}
            />
            {errors.phone_number && (
              <p className="text-sm text-red-500">{errors.phone_number.message}</p>
            )}
          </div>

          {/* Donation Type */}
          <div className="space-y-2">
            <Label htmlFor="donation_type">Donation Type</Label>
            <Select
              value={watchedType}
              onValueChange={(value) => {
                setValue('donation_type', value as DonationTypeLabel);
                trigger('donation_type');
              }}
            >
              <SelectTrigger className={errors.donation_type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select donation type" />
              </SelectTrigger>
              <SelectContent>
                {donationTypeOptions.map((donationType) => (
                  <SelectItem key={donationType} value={donationType}>
                    {donationType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.donation_type && (
              <p className="text-sm text-red-500">{errors.donation_type.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="donation_date">Date</Label>
            <Input
              id="donation_date"
              type="date"
              {...register('donation_date')}
              className={errors.donation_date ? 'border-red-500' : ''}
            />
            {errors.donation_date && (
              <p className="text-sm text-red-500">{errors.donation_date.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="donation_amount">Amount</Label>
            <Input
              id="donation_amount"
              type="number"
              placeholder="Enter amount"
              {...register('donation_amount', { valueAsNumber: true })}
              className={errors.donation_amount ? 'border-red-500' : ''}
              min="1"
              step="0.01"
            />
            {errors.donation_amount && (
              <p className="text-sm text-red-500">{errors.donation_amount.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Enter notes"
              {...register('notes')}
              className={errors.notes ? 'border-red-500' : ''}
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
              {isSubmitting ? 'Updating...' : 'Update Donation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
