import {
  StudentBloodGroup,
  StudentClass,
  StudentGender,
  StudentGroup,
  StudentResidentialCategory,
  StudentSection,
} from '@/domain/students/enums';

type Option<TValue extends string | number> = {
  value: TValue;
  label: string;
};

export const STUDENT_SECTION_LABELS: Record<StudentSection, string> = {
  [StudentSection.NAJERA]: 'Najera',
  [StudentSection.HIFZ]: 'Hifz',
  [StudentSection.NURANI]: 'Nurani',
  [StudentSection.KITAB]: 'Kitab',
};

export const STUDENT_GROUP_LABELS: Record<StudentGroup, string> = {
  [StudentGroup.NONE]: 'No group',
  [StudentGroup.IBTIDAIYYAH]: "Ibtida'iyyah",
  [StudentGroup.MUTAWASSITAH]: 'Mutawassitah',
  [StudentGroup.THANAWIYYAH_ULYA]: "Thanawiyyah 'Ulyā",
  [StudentGroup.ALIMIYYAH]: 'Ālimiyyah',
};

export const STUDENT_CLASS_LABELS: Record<StudentClass, string> = {
  [StudentClass.SHISHU]: 'Shishu',
  [StudentClass.ONE]: 'One',
  [StudentClass.TWO]: 'Two',
  [StudentClass.THREE]: 'Three',
  [StudentClass.FOUR]: 'Four',
  [StudentClass.FIVE]: 'Five',
  [StudentClass.SIX]: 'Six',
  [StudentClass.SEVEN]: 'Seven',
  [StudentClass.EIGHT]: 'Eight',
  [StudentClass.NINE]: 'Nine',
  [StudentClass.TEN]: 'Ten',
};

export const STUDENT_GENDER_LABELS: Record<StudentGender, string> = {
  [StudentGender.MALE]: 'Male',
  [StudentGender.FEMALE]: 'Female',
};

export const STUDENT_BLOOD_GROUP_LABELS: Record<StudentBloodGroup, string> = {
  [StudentBloodGroup.A_POSITIVE]: 'A+',
  [StudentBloodGroup.A_NEGATIVE]: 'A-',
  [StudentBloodGroup.B_POSITIVE]: 'B+',
  [StudentBloodGroup.B_NEGATIVE]: 'B-',
  [StudentBloodGroup.AB_POSITIVE]: 'AB+',
  [StudentBloodGroup.AB_NEGATIVE]: 'AB-',
  [StudentBloodGroup.O_POSITIVE]: 'O+',
  [StudentBloodGroup.O_NEGATIVE]: 'O-',
};

export const STUDENT_RESIDENTIAL_CATEGORY_LABELS: Record<StudentResidentialCategory, string> = {
  [StudentResidentialCategory.NORMAL]: 'Normal',
  [StudentResidentialCategory.MEDIUM]: 'Medium',
  [StudentResidentialCategory.VIP]: 'VIP',
};

export const STUDENT_SECTION_OPTIONS: Option<StudentSection>[] = (
  Object.entries(STUDENT_SECTION_LABELS) as Array<[string, string]>
).map(([value, label]) => ({
  value: Number.parseInt(value, 10) as StudentSection,
  label,
}));

export const STUDENT_GROUP_OPTIONS: Option<StudentGroup>[] = (
  Object.entries(STUDENT_GROUP_LABELS) as Array<[string, string]>
).map(([value, label]) => ({
  value: Number.parseInt(value, 10) as StudentGroup,
  label,
}));

export const STUDENT_CLASS_OPTIONS: Option<StudentClass>[] = (
  Object.entries(STUDENT_CLASS_LABELS) as Array<[string, string]>
).map(([value, label]) => ({
  value: Number.parseInt(value, 10) as StudentClass,
  label,
}));

export const STUDENT_GENDER_OPTIONS: Option<StudentGender>[] = (
  Object.entries(STUDENT_GENDER_LABELS) as Array<[StudentGender, string]>
).map(([value, label]) => ({
  value,
  label,
}));

export const STUDENT_BLOOD_GROUP_OPTIONS: Option<StudentBloodGroup>[] = (
  Object.entries(STUDENT_BLOOD_GROUP_LABELS) as Array<[StudentBloodGroup, string]>
).map(([value, label]) => ({
  value,
  label,
}));

export const STUDENT_RESIDENTIAL_CATEGORY_OPTIONS: Option<StudentResidentialCategory>[] = (
  Object.entries(STUDENT_RESIDENTIAL_CATEGORY_LABELS) as Array<[StudentResidentialCategory, string]>
).map(([value, label]) => ({
  value,
  label,
}));

export type { Option as StudentOption };
