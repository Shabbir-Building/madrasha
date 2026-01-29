import { parseBranchLabel } from '@/domain/branches';
import { StudentGroup } from '@/domain/students/enums';
import {
  parseResidentialCategoryLabel,
  parseStudentBloodGroupLabel,
  parseStudentClassLabel,
  parseStudentGenderLabel,
  parseStudentGroupLabel,
  parseStudentSectionLabel,
} from '@/domain/students/lib/parsers';
import type { CreateStudentInput } from '@/services/students/types';

type StudentFormPayloadSource = {
  branch: string;
  full_name: string;
  blood_group: string;
  birth_certificate_no: string;
  gender: string;
  registration_date: string;
  section_name: string;
  group_name?: string;
  class_name?: string;
  roll: string | number;
  current_location: string;
  permanent_location: string;
  day_care: boolean;
  residential: boolean;
  residential_category?: string;
  residential_fee?: number | string;
  class_fee?: number | string;
  waiver_amount?: number | string;
  webinars_amount?: number | string;
  total?: number | string;
  guardian_name: string;
  guardian_relation: string;
  phone_number: string;
  alternative_phone_number?: string;
  guardian_current_location: string;
  guardian_permanent_location: string;
  profile_image?: string;
};

const toNumber = (value: number | string | undefined, fallback = 0): number => {
  if (value == null || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const buildStudentPayload = (values: StudentFormPayloadSource): CreateStudentInput => {
  const branchEnum = parseBranchLabel(values.branch);
  if (branchEnum == null) {
    throw new Error('Invalid branch selected');
  }

  const genderEnum = parseStudentGenderLabel(values.gender);
  if (!genderEnum) {
    throw new Error('Invalid gender selected');
  }

  const bloodGroupEnum = parseStudentBloodGroupLabel(values.blood_group);
  if (!bloodGroupEnum) {
    throw new Error('Invalid blood group selected');
  }

  const sectionEnum = values.section_name ? parseStudentSectionLabel(values.section_name) : null;
  if (values.section_name && sectionEnum == null) {
    throw new Error('Invalid section selected');
  }

  const groupEnum = values.group_name
    ? parseStudentGroupLabel(values.group_name)
    : StudentGroup.NONE;
  if (values.group_name && groupEnum == null) {
    throw new Error('Invalid group selected');
  }

  const classEnum = values.class_name ? parseStudentClassLabel(values.class_name) : null;
  if (values.class_name && classEnum == null) {
    throw new Error('Invalid class selected');
  }

  const rollNumber = typeof values.roll === 'number' ? values.roll : Number(values.roll);
  if (!Number.isFinite(rollNumber) || rollNumber <= 0) {
    throw new Error('Roll number must be a positive number');
  }

  const classFee = toNumber(values.class_fee);

  const waiverAmount = toNumber(values.waiver_amount, toNumber(values.webinars_amount));

  const residentialCategoryEnum =
    values.residential && values.residential_category
      ? parseResidentialCategoryLabel(values.residential_category)
      : null;
  if (values.residential && residentialCategoryEnum == null) {
    throw new Error('Invalid residential category selected');
  }

  const residentialFee = values.residential ? toNumber(values.residential_fee) : 0;

  const total = Math.max(0, classFee + (values.residential ? residentialFee : 0) - waiverAmount);

  return {
    branch: branchEnum,
    profile_image: 'values.profile_image',
    full_name: values.full_name,
    blood_group: bloodGroupEnum,
    birth_certificate_no: values.birth_certificate_no,
    gender: genderEnum,
    registration_date: values.registration_date,
    section: sectionEnum ?? undefined,
    group: groupEnum ?? StudentGroup.NONE,
    class: classEnum ?? undefined,
    roll: Math.trunc(rollNumber),
    current_location: values.current_location,
    permanent_location: values.permanent_location,
    day_care: values.day_care,
    residential: values.residential,
    residential_category: values.residential ? (residentialCategoryEnum ?? undefined) : undefined,
    residential_fee: values.residential ? residentialFee : 0,
    waiver_amount: waiverAmount,
    class_fee: classFee,
    total,
    guardian_name: values.guardian_name,
    guardian_relation: values.guardian_relation,
    phone_number: values.phone_number,
    alternative_phone_number:
      values.alternative_phone_number && values.alternative_phone_number.trim().length > 0
        ? values.alternative_phone_number
        : undefined,
    guardian_current_location: values.guardian_current_location,
    guardian_permanent_location: values.guardian_permanent_location,
  };
};

export type { StudentFormPayloadSource };
