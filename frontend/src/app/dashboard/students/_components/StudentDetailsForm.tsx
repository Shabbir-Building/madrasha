'use client';

import { type AdminProfile, AdminRole } from '@/domain/admins';
import { BRANCH_LABELS, Branch } from '@/domain/branches';
import {
  STUDENT_BLOOD_GROUP_LABELS,
  STUDENT_BLOOD_GROUP_OPTIONS,
  STUDENT_CLASS_LABELS,
  STUDENT_CLASS_OPTIONS,
  STUDENT_GENDER_LABELS,
  STUDENT_GENDER_OPTIONS,
  STUDENT_GROUP_LABELS,
  STUDENT_GROUP_OPTIONS,
  STUDENT_PROFILE_PLACEHOLDERS,
  STUDENT_RESIDENTIAL_CATEGORY_FEES,
  STUDENT_RESIDENTIAL_CATEGORY_LABELS,
  STUDENT_RESIDENTIAL_CATEGORY_OPTIONS,
  STUDENT_SECTION_LABELS,
  STUDENT_SECTION_OPTIONS,
  StudentClass,
  StudentGender,
  StudentGroup,
  StudentResidentialCategory,
  StudentSection,
  buildStudentPayload,
  parseStudentGenderLabel,
} from '@/domain/students';
import { formatDate } from '@/lib/date-utils';
import { getStudentById, updateStudent } from '@/services/students';
import { Camera, Edit2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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

// Types
type StudentDetailsFormData = {
  // General Information
  branch: string;
  profile_image: string;
  full_name: string;
  blood_group: string;
  birth_certificate_no: string;
  gender: string;
  registration_date: string;
  section_name: string;
  group_name?: string;
  class_name?: string;
  roll: string;
  current_location: string;
  permanent_location: string;
  day_care: boolean;
  residential: boolean;
  residential_category: string;

  // Fee Information
  class_fee: number;
  residential_fee: number;
  webinars_amount: number;
  total: number;

  // Guardian Information
  guardian_name: string;
  guardian_relation: string;
  phone_number: string;
  alternative_phone_number: string;
  guardian_current_location: string;
  guardian_permanent_location: string;
};

const NO_GROUP_OPTION_VALUE = '__no_group__';
const NO_CLASS_OPTION_VALUE = '__no_class__';

interface StudentDetailsFormProps {
  admin?: AdminProfile;
  accessToken?: string;
  studentId: string;
}

export function StudentDetailsForm({ admin, accessToken, studentId }: StudentDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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
  } = useForm<StudentDetailsFormData>();

  const watchedValues = watch();

  const totalFee = Math.max(
    0,
    (Number(watchedValues.class_fee) || 0) +
      (watchedValues.residential ? Number(watchedValues.residential_fee) || 0 : 0) -
      (Number(watchedValues.webinars_amount) || 0),
  );

  const residentialCategoryLabel = watchedValues.residential_category
    ? (STUDENT_RESIDENTIAL_CATEGORY_OPTIONS.find(
        (option) => option.value === watchedValues.residential_category,
      )?.label ?? watchedValues.residential_category)
    : 'Not assigned';

  const fetchStudent = useCallback(async () => {
    if (!studentId) {
      setErrorMessage('Student ID is required');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const student = await getStudentById(studentId, {
        accessToken: accessToken,
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Transform API response to form data
      const formData: StudentDetailsFormData = {
        branch: BRANCH_LABELS[student.branch as Branch] || 'Boys',
        profile_image: student.profile_image || '',
        full_name: student.fullname,
        blood_group:
          STUDENT_BLOOD_GROUP_LABELS[
            student.blood_group as keyof typeof STUDENT_BLOOD_GROUP_LABELS
          ] || student.blood_group,
        birth_certificate_no: student.birth_certificate_no,
        gender: STUDENT_GENDER_LABELS[student.gender as StudentGender] || student.gender,
        registration_date: student.registration_date.split('T')[0] || '',
        section_name: student.enrollment?.section
          ? STUDENT_SECTION_LABELS[student.enrollment.section as StudentSection]
          : '',
        group_name: student.enrollment?.group
          ? STUDENT_GROUP_LABELS[student.enrollment.group as StudentGroup]
          : undefined,
        class_name: student.enrollment?.class
          ? STUDENT_CLASS_LABELS[student.enrollment.class as StudentClass]
          : undefined,
        roll: student.enrollment?.roll?.toString() || '',
        current_location: student.current_location,
        permanent_location: student.permanent_location,
        day_care: student.is_day_care || false,
        residential: student.is_residential || false,
        residential_category: student.residential_category
          ? STUDENT_RESIDENTIAL_CATEGORY_LABELS[
              student.residential_category as StudentResidentialCategory
            ]
          : '',
        class_fee: student.enrollment?.fee || 0,
        residential_fee: student.residential_fee || 0,
        webinars_amount: student.waiver_amount || 0,
        total: 0,
        guardian_name: student.guardian?.guardian_name || '',
        guardian_relation: student.guardian?.guardian_relation || '',
        phone_number: student.guardian?.phone_number || '',
        alternative_phone_number: '',
        guardian_current_location: student.guardian?.current_location || '',
        guardian_permanent_location: student.guardian?.permanent_location || '',
      };

      reset(formData);
    } catch {
      setErrorMessage('Failed to load student data');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, accessToken, reset]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  useEffect(() => {
    if (!watchedValues.residential) {
      setValue('residential_category', '');
      setValue('residential_fee', 0);
    }
  }, [watchedValues.residential, setValue]);

  useEffect(() => {
    setValue('total', totalFee);
  }, [totalFee, setValue]);

  const onSubmit = async (data: StudentDetailsFormData) => {
    if (!studentId) {
      setErrorMessage('Invalid student identifier');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const genderEnum = parseStudentGenderLabel(data.gender) ?? StudentGender.MALE;

      const profileImage =
        data.profile_image && data.profile_image.length > 0
          ? data.profile_image
          : STUDENT_PROFILE_PLACEHOLDERS[genderEnum];

      setValue('profile_image', profileImage);

      const payload = buildStudentPayload({
        ...data,
        profile_image: profileImage,
        waiver_amount: data.webinars_amount,
      });

      const { error } = await updateStudent(studentId, payload, {
        accessToken: accessToken,
      });

      if (error) {
        throw new Error(error.statusText || 'Failed to update student');
      }

      setIsEditing(false);
      toast.success('Student updated successfully');
      await fetchStudent();
    } catch {
      setErrorMessage('Failed to update student');
      toast.error('Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrorMessage(null);
  };

  const handleSave = handleSubmit(onSubmit);

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
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleCancel = () => {
    fetchStudent();
    setImagePreview(null);
    setErrorMessage(null);
    setIsEditing(false);
  };

  const handleDeleteStudent = async () => {
    if (!studentId) {
      toast.error('Invalid student identifier');
      return;
    }

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const genderEnum = parseStudentGenderLabel(watchedValues.gender) ?? StudentGender.MALE;
      const profileImage =
        watchedValues.profile_image && watchedValues.profile_image.length > 0
          ? watchedValues.profile_image
          : STUDENT_PROFILE_PLACEHOLDERS[genderEnum];

      const payload = buildStudentPayload({
        ...watchedValues,
        profile_image: profileImage,
      });

      payload.profile_image = profileImage;
      payload.disable = true;

      const { error } = await updateStudent(studentId, payload, {
        accessToken: accessToken,
      });

      if (error) {
        throw new Error(error.statusText || 'Failed to delete student');
      }

      toast.success('Student deleted successfully');
      setIsDeleteModalOpen(false);
      router.push('/dashboard/students');
      router.refresh();
    } catch {
      toast.error('Failed to delete student');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-30 w-30 cursor-pointer" onClick={handleAvatarClick}>
              <AvatarImage
                src={imagePreview || watchedValues.profile_image}
                alt={watchedValues.full_name}
              />
              <AvatarFallback className="text-md">
                {watchedValues.full_name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
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
            <h1 className="text-3xl font-bold">{watchedValues.full_name}</h1>
            <p className="text-muted-foreground">
              {watchedValues.class_name || 'Not assigned'} - {watchedValues.section_name} | Roll:{' '}
              {watchedValues.roll}
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
                {isSaving ? 'Saving Student...' : 'Save Changes'}
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

      {errorMessage && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent>
            <div className="flex items-center gap-2 text-destructive py-2">
              <p className="text-sm font-medium">{errorMessage}</p>
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
                Branch
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
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="full_name">
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('full_name', { required: 'Full name is required' })}
                  placeholder="Enter full name"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">{watchedValues.full_name}</div>
              )}
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="blood_group">
                Blood Group
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.blood_group}
                  onValueChange={(value) => setValue('blood_group', value)}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_BLOOD_GROUP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.blood_group}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="birth_certificate_no">
                Birth Certificate No
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('birth_certificate_no')}
                  placeholder="Enter birth certificate number"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.birth_certificate_no}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="gender">
                Gender
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
                    {STUDENT_GENDER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">{watchedValues.gender}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="registration_date">
                Registration Date
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="date"
                  {...register('registration_date')}
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {formatDate(watchedValues.registration_date)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="section_name">
                Section
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.section_name}
                  onValueChange={(value) => setValue('section_name', value)}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_SECTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.section_name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="group_name">
                Group
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.group_name ?? NO_GROUP_OPTION_VALUE}
                  onValueChange={(value) =>
                    setValue('group_name', value === NO_GROUP_OPTION_VALUE ? undefined : value)
                  }
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_GROUP_OPTION_VALUE}>No group</SelectItem>
                    {STUDENT_GROUP_OPTIONS.filter(
                      (option) => option.value !== StudentGroup.NONE,
                    ).map((option) => (
                      <SelectItem key={option.value} value={option.label}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.group_name || 'Not assigned'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="class_name">
                Class
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.class_name ?? NO_CLASS_OPTION_VALUE}
                  onValueChange={(value) =>
                    setValue('class_name', value === NO_CLASS_OPTION_VALUE ? undefined : value)
                  }
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select class" />
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
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.class_name || 'Not assigned'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="roll">
                Roll
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('roll')}
                  placeholder="Enter roll number"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">{watchedValues.roll}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="current_location">
                Current Location
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
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="permanent_location">
                Permanent Location
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
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="day_care">
                Day Care
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.day_care ? 'Yes' : 'No'}
                  onValueChange={(value) => setValue('day_care', value === 'Yes')}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select day care" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.day_care ? 'Yes' : 'No'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="residential">
                Residential
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.residential ? 'Yes' : 'No'}
                  onValueChange={(value) => setValue('residential', value === 'Yes')}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select residential" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.residential ? 'Yes' : 'No'}
                </div>
              )}
            </div>

            {watchedValues.residential && (
              <div className="space-y-2">
                <Label className="text-md" htmlFor="residential_category">
                  Residential Category
                </Label>
                {isEditing ? (
                  <Select
                    value={watchedValues.residential_category}
                    onValueChange={handleResidentialCategoryChange}
                  >
                    <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                      <SelectValue placeholder="Select residential category" />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENT_RESIDENTIAL_CATEGORY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ( ৳
                          {STUDENT_RESIDENTIAL_CATEGORY_FEES[option.value].toLocaleString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2 text-sm bg-muted/40 rounded-md">
                    {residentialCategoryLabel}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Information Card */}
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
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="number"
                  {...register('class_fee', { valueAsNumber: true })}
                  placeholder="Enter class fee"
                />
              ) : (
                <div className="p-2 text-md bg-muted/40 rounded-md">
                  ৳{watchedValues.class_fee?.toLocaleString()}
                </div>
              )}
            </div>

            {watchedValues.residential && (
              <div className="space-y-2">
                <Label className="text-md" htmlFor="residential_fee">
                  Residential Fee
                </Label>
                {isEditing ? (
                  <Input
                    className="bg-muted/40 dark:bg-input/40"
                    type="number"
                    {...register('residential_fee', { valueAsNumber: true })}
                    placeholder="Enter residential fee"
                  />
                ) : (
                  <div className="p-2 text-md bg-muted/40 rounded-md">
                    ৳{watchedValues.residential_fee?.toLocaleString()}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-md" htmlFor="webinars_amount">
                Webinars Amount
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  type="number"
                  {...register('webinars_amount', { valueAsNumber: true })}
                  placeholder="Enter webinars amount"
                />
              ) : (
                <div className="p-2 text-md bg-muted/40 rounded-md">
                  ৳{watchedValues.webinars_amount?.toLocaleString()}
                </div>
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

      {/* Guardian Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Information</CardTitle>
          <CardDescription>Guardian details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_name">
                Guardian Name
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('guardian_name', { required: 'Guardian name is required' })}
                  placeholder="Enter guardian name"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.guardian_name}
                </div>
              )}
              {errors.guardian_name && (
                <p className="text-sm text-destructive">{errors.guardian_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_relation">
                Relation
              </Label>
              {isEditing ? (
                <Select
                  value={watchedValues.guardian_relation}
                  onValueChange={(value) => setValue('guardian_relation', value)}
                >
                  <SelectTrigger className="bg-muted/40 dark:bg-input/40">
                    <SelectValue placeholder="Select relation" />
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
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.guardian_relation}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="phone_number">
                Phone Number
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('phone_number', { required: 'Phone number is required' })}
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.phone_number}
                </div>
              )}
              {errors.phone_number && (
                <p className="text-sm text-destructive">{errors.phone_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="alternative_phone_number">
                Alternative Phone
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('alternative_phone_number')}
                  placeholder="Enter alternative phone number"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.alternative_phone_number || 'N/A'}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_current_location">
                Current Location
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('guardian_current_location')}
                  placeholder="Enter current location"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.guardian_current_location}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-md" htmlFor="guardian_permanent_location">
                Permanent Location
              </Label>
              {isEditing ? (
                <Input
                  className="bg-muted/40 dark:bg-input/40"
                  {...register('guardian_permanent_location')}
                  placeholder="Enter permanent location"
                />
              ) : (
                <div className="p-2 text-sm bg-muted/40 rounded-md">
                  {watchedValues.guardian_permanent_location}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Student"
        description="Are you sure you want to remove this admin? This action cannot be undone."
        confirmLabel="Delete Student"
        confirmDisabled={isDeleting}
        confirmLoading={isDeleting}
        onConfirm={handleDeleteStudent}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={imagePreview || watchedValues.profile_image || '/placeholder.svg'}
              alt={watchedValues.full_name}
            />
            <AvatarFallback className="text-sm font-medium">
              {watchedValues.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'ST'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{watchedValues.full_name}</div>
            <div className="text-sm text-muted-foreground">
              {watchedValues.class_name
                ? `${watchedValues.class_name} ${watchedValues.section_name ? `• ${watchedValues.section_name}` : ''}`
                : 'No class assigned'}
            </div>
          </div>
        </div>
      </ConfirmDeleteModal>
    </div>
  );
}
