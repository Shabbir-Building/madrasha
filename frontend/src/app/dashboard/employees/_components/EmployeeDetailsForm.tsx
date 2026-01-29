'use client';

import { type AdminProfile, AdminRole } from '@/domain/admins';
import { parseBranchLabel } from '@/domain/branches';
import {
  DESIGNATION_BY_EMPLOYEE_TYPE,
  DESIGNATION_LABELS,
  Designation,
  EMPLOYEE_TYPE_LABELS,
  EmployeeType,
} from '@/domain/employees';
import { formatDate } from '@/lib/date-utils';
import { getEmployeeById, updateEmployee } from '@/services/employees';
import type { UpdateEmployeeInput } from '@/services/employees/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Edit2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Zod Schema
const employeeFormSchema = z
  .object({
    branch: z.string().min(1, 'Branch is required'),
    employment_type: z.number().min(1, 'Employment type is required'),
    designation: z.number().min(1, 'Designation is required'),
    profile_image: z.string().optional(),
    fullname: z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must not exceed 100 characters'),
    nid_no: z.string().regex(/^\d{10}$/, 'NID number must be exactly 10 digits'),
    gender: z.string().min(1, 'Gender is required').max(20, 'Gender must not exceed 20 characters'),
    phone_number: z.string().regex(/^01\d{9}$/, 'Phone number must be 11 digits starting with 01'),
    join_date: z.string().min(1, 'Join date is required'),
    resign_date: z.string().optional(),
    salary: z.coerce
      .number()
      .min(0, 'Salary must be non-negative')
      .max(9999999999, 'Salary must not exceed 10 digits'),
    bonus: z.coerce
      .number()
      .min(0, 'Bonus must be non-negative')
      .max(9999999999, 'Bonus must not exceed 10 digits')
      .optional(),
    current_location: z
      .string()
      .min(1, 'Current location is required')
      .max(250, 'Current location must not exceed 250 characters'),
    permanent_location: z
      .string()
      .min(1, 'Permanent location is required')
      .max(250, 'Permanent location must not exceed 250 characters'),
  })
  .superRefine((data, ctx) => {
    // Salary validation
    if (data.salary < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Salary must be non-negative',
        path: ['salary'],
      });
    }

    // Bonus validation
    if (data.bonus && data.bonus < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bonus must be non-negative',
        path: ['bonus'],
      });
    }
  });

type EmployeeDetailsFormData = z.infer<typeof employeeFormSchema>;

interface EmployeeDetailsFormProps {
  admin?: AdminProfile;
  accessToken?: string;
  employeeId: string;
}

export function EmployeeDetailsForm({ admin, accessToken, employeeId }: EmployeeDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isSuperAdmin = admin?.role === AdminRole.SUPER_ADMIN;
  const canAccessBoys = isSuperAdmin || admin?.permissions?.access_boys_section;
  const canAccessGirls = isSuperAdmin || admin?.permissions?.access_girls_section;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EmployeeDetailsFormData>({
    // @ts-expect-error - Type mismatch between Zod and react-hook-form
    resolver: zodResolver(employeeFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      branch: '',
      profile_image: '',
      fullname: '',
      nid_no: '',
      gender: '',
      phone_number: '',
      employment_type: 0,
      designation: 0,
      join_date: '',
      resign_date: '',
      salary: 0,
      bonus: 0,
      current_location: '',
      permanent_location: '',
    },
  });

  const watchedValues = watch();

  // Fetch employee data function
  const fetchEmployee = useCallback(async () => {
    if (!employeeId) {
      setError('Employee ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const employee = await getEmployeeById(employeeId, {
        accessToken: accessToken,
      });

      if (!employee) {
        setError('Employee not found');
        setIsLoading(false);
        return;
      }

      // Convert backend data to form format
      console.log('eeeelelle', employee.branch);
      const branchLabel = employee.branch === 2 ? 'Boys' : employee.branch === 3 ? 'Girls' : '';
      const joinDate = employee.join_date
        ? new Date(employee.join_date).toISOString().split('T')[0]
        : '';
      const resignDate = employee.resign_date
        ? new Date(employee.resign_date).toISOString().split('T')[0]
        : '';

      reset({
        branch: branchLabel,
        profile_image: employee.profile_image || '',
        fullname: employee.fullname || '',
        nid_no: employee.nid_no || '',
        gender: employee.gender || '',
        phone_number: employee.phone_number || '',
        employment_type: employee.employment_type || 0,
        designation: employee.designation || 0,
        join_date: joinDate,
        resign_date: resignDate,
        salary: employee.salary || 0,
        bonus: employee.bonus || 0,
        current_location: employee.current_location || '',
        permanent_location: employee.permanent_location || '',
      });

      if (employee.profile_image) {
        setImagePreview(employee.profile_image);
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load employee data');
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, accessToken, reset]);

  // Fetch employee data on mount
  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const onSubmit = async (data: EmployeeDetailsFormData) => {
    setIsSaving(true);
    setError(null);

    try {
      // Convert branch label to enum number
      const branchEnum = parseBranchLabel(data.branch);
      if (branchEnum == null) {
        throw new Error('Invalid branch selected');
      }

      // Prepare payload for update
      const payload: Record<string, unknown> = {
        branch: branchEnum,
        employment_type: Number(data.employment_type),
        designation: Number(data.designation),
        fullname: data.fullname,
        profile_image: data.profile_image,
        nid_no: data.nid_no,
        gender: data.gender,
        phone_number: data.phone_number,
        join_date: data.join_date,
        salary: Number(data.salary),
        bonus: Number(data.bonus) || 0,
        current_location: data.current_location,
        permanent_location: data.permanent_location,
      };

      // Only include resign_date if it's provided
      if (data.resign_date) {
        payload.resign_date = data.resign_date;
      }

      const { error } = await updateEmployee(employeeId, payload, {
        accessToken: accessToken,
      });

      if (error) {
        throw new Error(error.statusText || 'Failed to update employee');
      }

      toast.success('Employee updated successfully');
      setIsEditing(false);
      // Reload the employee data to show updated values
      fetchEmployee();
    } catch (err) {
      const errorMessage = (err as Error).message || 'Failed to update employee';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setHasAttemptedSubmit(true);
    // @ts-expect-error - Type mismatch between Zod and react-hook-form
    handleSubmit(onSubmit)();
  };

  const handleEmploymentTypeChange = (employmentType: string) => {
    setValue('employment_type', Number(employmentType), { shouldValidate: true });
    setValue('designation', 0, { shouldValidate: true });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setValue('profile_image', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setHasAttemptedSubmit(false);
    // Reload the employee data to restore original values
    fetchEmployee();
  };

  const handleDeleteEmployee = async () => {
    if (!employeeId) {
      toast.error('Invalid employee identifier');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const payload: UpdateEmployeeInput = {
        disable: true,
      };

      const { error: updateError } = await updateEmployee(employeeId, payload, {
        accessToken: accessToken,
      });

      if (updateError) {
        throw new Error(updateError.statusText || 'Failed to delete employee');
      }

      toast.success('Employee deleted successfully');
      setIsDeleteModalOpen(false);
      router.push('/dashboard/employees');
      router.refresh();
    } catch {
      toast.error('Failed to delete employee');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate total salary
  const totalSalary = (Number(watchedValues.salary) || 0) + (Number(watchedValues.bonus) || 0);

  // Get designations for selected employment type
  const availableDesignations = watchedValues.employment_type
    ? DESIGNATION_BY_EMPLOYEE_TYPE[watchedValues.employment_type as EmployeeType] || []
    : [];

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto space-y-6">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent>
            <div className="flex flex-col items-center gap-4 py-8">
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" onClick={() => router.push('/dashboard/employees')}>
                Back to Employees
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials =
    watchedValues.fullname
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'EM';

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-30 w-30 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage
                src={imagePreview || watchedValues.profile_image}
                alt={watchedValues.fullname}
              />
              <AvatarFallback className="text-md">{initials}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <div
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                <Camera className="h-8 w-8 text-white" />
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{watchedValues.fullname || 'Employee'}</h1>
            <p className="text-muted-foreground">
              {watchedValues.employment_type && watchedValues.designation
                ? `${EMPLOYEE_TYPE_LABELS[watchedValues.employment_type as EmployeeType]} - ${DESIGNATION_LABELS[watchedValues.designation as Designation]}`
                : 'Employee Details'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4" />
                {isSaving ? 'Saving Employee...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="gap-0">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-destructive text-white hover:bg-destructive/90"
            disabled={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* General Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic employee information and employment details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-md" htmlFor="branch">
                Branch <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.branch}
                  onValueChange={(value) => setValue('branch', value)}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {canAccessBoys && <SelectItem value="Boys">Boys</SelectItem>}
                    {canAccessGirls && <SelectItem value="Girls">Girls</SelectItem>}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">{watchedValues.branch}</div>
              )}
              {hasAttemptedSubmit && errors.branch && (
                <p className="text-sm text-destructive">{errors.branch.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="employment_type">
                Employment Type <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Select
                  value={
                    watchedValues.employment_type
                      ? watchedValues.employment_type.toString()
                      : undefined
                  }
                  onValueChange={handleEmploymentTypeChange}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(EmployeeType)
                      .filter((v) => typeof v === 'number')
                      .map((type) => (
                        <SelectItem key={type} value={type.toString()}>
                          {EMPLOYEE_TYPE_LABELS[type as EmployeeType]}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.employment_type
                    ? EMPLOYEE_TYPE_LABELS[watchedValues.employment_type as EmployeeType]
                    : 'N/A'}
                </div>
              )}
              {hasAttemptedSubmit && errors.employment_type && (
                <p className="text-sm text-destructive">{errors.employment_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="designation">
                Designation <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Select
                  value={
                    watchedValues.designation ? watchedValues.designation.toString() : undefined
                  }
                  onValueChange={(value) =>
                    setValue('designation', Number(value), { shouldValidate: true })
                  }
                  disabled={!watchedValues.employment_type}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDesignations.map((designation) => (
                      <SelectItem key={designation} value={designation.toString()}>
                        {DESIGNATION_LABELS[designation]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.designation
                    ? DESIGNATION_LABELS[watchedValues.designation as Designation]
                    : 'N/A'}
                </div>
              )}
              {hasAttemptedSubmit && errors.designation && (
                <p className="text-sm text-destructive">{errors.designation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="fullname">
                Full Name <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('fullname')}
                  placeholder="Enter full name"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">{watchedValues.fullname}</div>
              )}
              {hasAttemptedSubmit && errors.fullname && (
                <p className="text-sm text-destructive">{errors.fullname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="nid_no">
                NID Number <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('nid_no')}
                  placeholder="Enter NID number"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">{watchedValues.nid_no}</div>
              )}
              {hasAttemptedSubmit && errors.nid_no && (
                <p className="text-sm text-destructive">{errors.nid_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.gender}
                  onValueChange={(value) => setValue('gender', value)}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">{watchedValues.gender}</div>
              )}
              {hasAttemptedSubmit && errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="phone_number">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('phone_number')}
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.phone_number}
                </div>
              )}
              {hasAttemptedSubmit && errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="join_date">
                Join Date <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="date"
                  {...register('join_date')}
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {formatDate(watchedValues.join_date)}
                </div>
              )}
              {hasAttemptedSubmit && errors.join_date && (
                <p className="text-sm text-destructive">{errors.join_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="resign_date">
                Resign Date
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="date"
                  {...register('resign_date')}
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.resign_date ? formatDate(watchedValues.resign_date) : 'N/A'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="current_location">
                Current Location <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('current_location')}
                  placeholder="Enter current location"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.current_location}
                </div>
              )}
              {hasAttemptedSubmit && errors.current_location && (
                <p className="text-sm text-destructive">{errors.current_location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="permanent_location">
                Permanent Location <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('permanent_location')}
                  placeholder="Enter permanent location"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.permanent_location}
                </div>
              )}
              {hasAttemptedSubmit && errors.permanent_location && (
                <p className="text-sm text-destructive">{errors.permanent_location.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Information</CardTitle>
          <CardDescription>Employee salary details and compensation information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-md" htmlFor="salary">
                Salary <span className="text-destructive">*</span>
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="number"
                  {...register('salary')}
                  placeholder="Enter salary amount"
                />
              ) : (
                <div className="p-2 text-md bg-muted/40 rounded-md">
                  ৳{watchedValues.salary?.toLocaleString()}
                </div>
              )}
              {hasAttemptedSubmit && errors.salary && (
                <p className="text-sm text-destructive">{errors.salary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="bonus">
                Bonus
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="number"
                  {...register('bonus')}
                  placeholder="Enter bonus amount"
                />
              ) : (
                <div className="p-2 text-md bg-muted/40 rounded-md">
                  ৳{watchedValues.bonus?.toLocaleString()}
                </div>
              )}
              {hasAttemptedSubmit && errors.bonus && (
                <p className="text-sm text-destructive">{errors.bonus.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="total_salary">
                Total Salary
              </Label>
              <div className="p-2 text-md bg-primary/10 font-semibold rounded-md">
                ৳{totalSalary.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Employee"
        description="Are you sure you want to remove this employee? This action will disable the record instead of deleting it."
        confirmLabel="Delete Employee"
        confirmDisabled={isDeleting}
        confirmLoading={isDeleting}
        onConfirm={handleDeleteEmployee}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={imagePreview || watchedValues.profile_image || '/placeholder.svg'}
              alt={watchedValues.fullname || 'Employee'}
            />
            <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{watchedValues.fullname || 'Employee'}</div>
            <div className="text-sm text-muted-foreground">
              {watchedValues.employment_type && watchedValues.designation
                ? `${EMPLOYEE_TYPE_LABELS[watchedValues.employment_type as EmployeeType]} - ${DESIGNATION_LABELS[watchedValues.designation as Designation]}`
                : 'Employee Details'}
            </div>
          </div>
        </div>
      </ConfirmDeleteModal>
    </div>
  );
}
