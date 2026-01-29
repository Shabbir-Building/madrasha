'use client';

import { type AdminProfile, AdminRole } from '@/domain/admins';
import {
  STUDENT_BLOOD_GROUP_OPTIONS,
  STUDENT_CLASS_OPTIONS,
  STUDENT_GENDER_OPTIONS,
  STUDENT_GROUP_OPTIONS,
  STUDENT_PROFILE_PLACEHOLDERS,
  STUDENT_RESIDENTIAL_CATEGORY_FEES,
  STUDENT_RESIDENTIAL_CATEGORY_OPTIONS,
  STUDENT_SECTION_OPTIONS,
  StudentGender,
  StudentGroup,
  StudentResidentialCategory,
  buildStudentPayload,
  parseStudentGenderLabel,
} from '@/domain/students';
import { createStudent } from '@/services/students';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Save } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

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
const studentFormSchema = z
  .object({
    // General Information
    branch: z.string().min(1, 'Branch is required'),
    profile_image: z.string().optional(),
    full_name: z.string().min(1, 'Full name is required'),
    blood_group: z.string().min(1, 'Blood group is required'),
    birth_certificate_no: z
      .string()
      .min(1, 'Birth certificate number is required')
      .min(17, 'Birth certificate number must be at least 17 characters long'),
    gender: z.string().min(1, 'Gender is required'),
    registration_date: z.string().min(1, 'Registration date is required'),
    section_name: z.string().min(1, 'Section is required'),
    group_name: z.string().optional(),
    class_name: z.string().optional(),
    roll: z.string().min(1, 'Roll number is required'),
    current_location: z.string().min(1, 'Current location is required'),
    permanent_location: z.string().min(1, 'Permanent location is required'),
    day_care: z.boolean(),
    residential: z.boolean(),
    residential_category: z.string().optional().or(z.literal('')),

    // Fee Information
    class_fee: z.coerce.number().optional().default(0),
    residential_fee: z.coerce.number().optional().default(0),
    waiver_amount: z.coerce.number().min(0, 'Waiver amount must be positive'),
    total: z.coerce.number(),

    // Guardian Information
    guardian_name: z.string().min(1, 'Guardian name is required'),
    guardian_relation: z.string().min(1, 'Guardian relation is required'),
    phone_number: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^01\d{9}$/, 'Phone number must be 11 digits starting with 01'),
    alternative_phone_number: z
      .string()
      .regex(/^01\d{9}$/, 'Phone number must be 11 digits starting with 01')
      .optional()
      .or(z.literal('')),
    guardian_current_location: z.string().min(1, 'Guardian current location is required'),
    guardian_permanent_location: z.string().min(1, 'Guardian permanent location is required'),
  })
  .superRefine((data, ctx) => {
    if (data.residential) {
      if (!data.residential_category || data.residential_category.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Residential category is required when residential is selected',
          path: ['residential_category'],
        });
      }
    }
  });

type StudentFormData = z.infer<typeof studentFormSchema>;

const NO_GROUP_OPTION_VALUE = '__no_group__';
const NO_CLASS_OPTION_VALUE = '__no_class__';

interface AddStudentFormProps {
  admin?: AdminProfile;
  accessToken?: string;
}

export function AddStudentForm({ admin, accessToken }: AddStudentFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  } = useForm<StudentFormData>({
    // @ts-expect-error - Type mismatch between Zod and react-hook-form
    resolver: zodResolver(studentFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      branch:
        canAccessBoys && !canAccessGirls ? 'Boys' : canAccessGirls && !canAccessBoys ? 'Girls' : '',
      profile_image: '',
      full_name: '',
      blood_group: '',
      birth_certificate_no: '',
      gender: '',
      registration_date: '',
      section_name: '',
      group_name: undefined,
      class_name: undefined,
      roll: '',
      current_location: '',
      permanent_location: '',
      day_care: false,
      residential: false,
      residential_category: '',
      class_fee: 0,
      residential_fee: 0,
      waiver_amount: 0,
      total: 0,
      guardian_name: '',
      guardian_relation: '',
      phone_number: '',
      alternative_phone_number: '',
      guardian_current_location: '',
      guardian_permanent_location: '',
    },
  });

  const watchedValues = watch();

  const totalFee = Math.max(
    0,
    (Number(watchedValues.class_fee) || 0) +
      (watchedValues.residential ? Number(watchedValues.residential_fee) || 0 : 0) -
      (Number(watchedValues.waiver_amount) || 0),
  );

  useEffect(() => {
    if (!watchedValues.residential) {
      setValue('residential_category', '', { shouldValidate: true });
      setValue('residential_fee', 0, { shouldValidate: true });
    }
  }, [watchedValues.residential, setValue]);

  useEffect(() => {
    setValue('total', totalFee, { shouldValidate: false });
  }, [totalFee, setValue]);

  const onSubmit: SubmitHandler<StudentFormData> = async (values) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const genderEnum = parseStudentGenderLabel(values.gender) ?? StudentGender.MALE;

      const profileImage =
        values.profile_image && values.profile_image.length > 0
          ? values.profile_image
          : STUDENT_PROFILE_PLACEHOLDERS[genderEnum];

      setValue('profile_image', profileImage);

      const payload = buildStudentPayload({
        ...values,
        profile_image: profileImage,
      });

      const { error } = await createStudent(payload, {
        accessToken: accessToken,
      });
      console.log('sddsfsf', error);
      if (error) {
        throw new Error(error.statusText || 'Failed to create student');
      }

      reset();
      setImagePreview(null);
      setHasAttemptedSubmit(false);
      router.push('/dashboard/students');
      toast.success('Student created successfully');
    } catch (error) {
      setErrorMessage('Failed to create student');
      toast.error('Failed to create student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = () => {
    setErrorMessage(null);
    if (!watchedValues.profile_image && !imagePreview) {
      const genderEnum = parseStudentGenderLabel(watchedValues.gender) ?? StudentGender.MALE;
      const placeholder = STUDENT_PROFILE_PLACEHOLDERS[genderEnum];
      setValue('profile_image', placeholder, { shouldValidate: true });
      setImagePreview(placeholder);
    }
    setHasAttemptedSubmit(true);
    (handleSubmit as unknown as (fn: SubmitHandler<StudentFormData>) => () => void)(onSubmit)();
  };

  const handleResidentialCategoryChange = (categoryValue: string) => {
    const category =
      (categoryValue as StudentResidentialCategory) ?? StudentResidentialCategory.NORMAL;
    setValue('residential_category', category, { shouldValidate: true });
    setValue('residential_fee', STUDENT_RESIDENTIAL_CATEGORY_FEES[category] ?? 0, {
      shouldValidate: true,
    });
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
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-30 w-30 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage
                src={imagePreview || watchedValues.profile_image}
                alt={watchedValues.full_name || 'Student'}
              />
              <AvatarFallback className="text-md">
                {watchedValues.full_name
                  ? watchedValues.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : 'ST'}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={handleAvatarClick}
            >
              <Camera className="h-8 w-8 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{watchedValues.full_name || 'New Student'}</h1>
            <p className="text-muted-foreground">
              {watchedValues.class_name && watchedValues.section_name && watchedValues.roll
                ? `${watchedValues.class_name} - ${watchedValues.section_name} | Roll: ${watchedValues.roll}`
                : 'Enter student details'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleFormSubmit} disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving Student...' : 'Save Student'}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent>
            <div className="flex items-center gap-2 text-destructive py-2">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasAttemptedSubmit && !imagePreview && !watchedValues.profile_image && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent>
            <div className="flex items-center gap-2 text-destructive">
              <Camera className="h-4 w-4" />
              <p className="text-sm font-medium">
                Profile image is required. Please upload a student photo.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
          <CardDescription>Basic student information and academic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-md" htmlFor="branch">
                Branch <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.branch}
                onValueChange={(value) => setValue('branch', value, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {canAccessBoys && <SelectItem value="Boys">Boys</SelectItem>}
                  {canAccessGirls && <SelectItem value="Girls">Girls</SelectItem>}
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && errors.branch && (
                <p className="text-sm text-destructive">{errors.branch.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="full_name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('full_name')}
                placeholder="Enter full name"
              />
              {hasAttemptedSubmit && errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="blood_group">
                Blood Group <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.blood_group}
                onValueChange={(value) => setValue('blood_group', value, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_BLOOD_GROUP_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && errors.blood_group && (
                <p className="text-sm text-destructive">{errors.blood_group.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="birth_certificate_no">
                Birth Certificate No <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('birth_certificate_no')}
                placeholder="Enter birth certificate number"
              />
              {hasAttemptedSubmit && errors.birth_certificate_no && (
                <p className="text-sm text-destructive">{errors.birth_certificate_no.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="gender">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.gender}
                onValueChange={(value) => setValue('gender', value, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && errors.gender && (
                <p className="text-sm text-destructive">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="registration_date">
                Registration Date <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                type="date"
                {...register('registration_date')}
              />
              {hasAttemptedSubmit && errors.registration_date && (
                <p className="text-sm text-destructive">{errors.registration_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="section_name">
                Section <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.section_name}
                onValueChange={(value) => setValue('section_name', value, { shouldValidate: true })}
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {STUDENT_SECTION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && errors.section_name && (
                <p className="text-sm text-destructive">{errors.section_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="group_name">
                Group
              </Label>
              <Select
                value={watchedValues.group_name ?? NO_GROUP_OPTION_VALUE}
                onValueChange={(value) =>
                  setValue('group_name', value === NO_GROUP_OPTION_VALUE ? undefined : value, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_GROUP_OPTION_VALUE}>No group</SelectItem>
                  {STUDENT_GROUP_OPTIONS.filter((option) => option.value !== StudentGroup.NONE).map(
                    (option) => (
                      <SelectItem key={option.value} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="class_name">
                Class
              </Label>
              <Select
                value={watchedValues.class_name ?? NO_CLASS_OPTION_VALUE}
                onValueChange={(value) =>
                  setValue('class_name', value === NO_CLASS_OPTION_VALUE ? undefined : value, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CLASS_OPTION_VALUE}>No class</SelectItem>
                  {STUDENT_CLASS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.label}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="roll">
                Roll <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                type="number"
                {...register('roll')}
                placeholder="Enter roll number"
              />
              {hasAttemptedSubmit && errors.roll && (
                <p className="text-sm text-destructive">{errors.roll.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="current_location">
                Current Location <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('current_location')}
                placeholder="Enter current location"
              />
              {hasAttemptedSubmit && errors.current_location && (
                <p className="text-sm text-destructive">{errors.current_location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="permanent_location">
                Permanent Location <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('permanent_location')}
                placeholder="Enter permanent location"
              />
              {hasAttemptedSubmit && errors.permanent_location && (
                <p className="text-sm text-destructive">{errors.permanent_location.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="day_care">
                Day Care <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.day_care ? 'Yes' : 'No'}
                onValueChange={(value) =>
                  setValue('day_care', value === 'Yes', { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="residential">
                Residential <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.residential ? 'Yes' : 'No'}
                onValueChange={(value) =>
                  setValue('residential', value === 'Yes', { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {watchedValues.residential && (
              <div className="space-y-2">
                <Label className="text-md" htmlFor="residential_category">
                  Residential Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watchedValues.residential_category}
                  onValueChange={handleResidentialCategoryChange}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_RESIDENTIAL_CATEGORY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} (৳
                        {STUDENT_RESIDENTIAL_CATEGORY_FEES[option.value].toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {hasAttemptedSubmit && errors.residential_category && (
                  <p className="text-sm text-destructive">{errors.residential_category.message}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fee Information</CardTitle>
          <CardDescription>Student fee details and payment information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-md" htmlFor="class_fee">
                Class Fee
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                type="number"
                {...register('class_fee')}
                placeholder="Enter class fee"
              />
              {hasAttemptedSubmit && errors.class_fee && (
                <p className="text-sm text-destructive">{errors.class_fee.message}</p>
              )}
            </div>

            {watchedValues.residential && (
              <div className="space-y-2">
                <Label className="text-md" htmlFor="residential_fee">
                  Residential Fee
                </Label>
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="number"
                  {...register('residential_fee')}
                  placeholder="Enter residential fee"
                  disabled
                />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-md" htmlFor="waiver_amount">
                Waiver Amount
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                type="number"
                {...register('waiver_amount')}
                placeholder="Enter waiver amount"
              />
              {hasAttemptedSubmit && errors.waiver_amount && (
                <p className="text-sm text-destructive">{errors.waiver_amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="total">
                Total
              </Label>
              <div className="p-2 text-md bg-primary/10 font-semibold rounded-md">
                ৳{totalFee.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guardian Information</CardTitle>
          <CardDescription>Guardian details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_name">
                Guardian Name <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('guardian_name')}
                placeholder="Enter guardian name"
              />
              {hasAttemptedSubmit && errors.guardian_name && (
                <p className="text-sm text-destructive">{errors.guardian_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_relation">
                Relation <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedValues.guardian_relation}
                onValueChange={(value) =>
                  setValue('guardian_relation', value, { shouldValidate: true })
                }
              >
                <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Father">Father</SelectItem>
                  <SelectItem value="Mother">Mother</SelectItem>
                  <SelectItem value="Brother">Brother</SelectItem>
                  <SelectItem value="Sister">Sister</SelectItem>
                  <SelectItem value="Uncle">Uncle</SelectItem>
                  <SelectItem value="Aunt">Aunt</SelectItem>
                  <SelectItem value="Grandfather">Grandfather</SelectItem>
                  <SelectItem value="Grandmother">Grandmother</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {hasAttemptedSubmit && errors.guardian_relation && (
                <p className="text-sm text-destructive">{errors.guardian_relation.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="phone_number">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('phone_number')}
                placeholder="Enter phone number"
              />
              {hasAttemptedSubmit && errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="alternative_phone_number">
                Alternative Phone
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('alternative_phone_number')}
                placeholder="Enter alternative phone number"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_current_location">
                Current Location <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('guardian_current_location')}
                placeholder="Enter current location"
              />
              {hasAttemptedSubmit && errors.guardian_current_location && (
                <p className="text-sm text-destructive">
                  {errors.guardian_current_location.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_permanent_location">
                Permanent Location <span className="text-destructive">*</span>
              </Label>
              <Input
                className="bg-muted/40 dark:bg-input/40"
                {...register('guardian_permanent_location')}
                placeholder="Enter permanent location"
              />
              {hasAttemptedSubmit && errors.guardian_permanent_location && (
                <p className="text-sm text-destructive">
                  {errors.guardian_permanent_location.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
