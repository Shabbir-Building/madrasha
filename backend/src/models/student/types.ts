import { type Document, type Types } from "mongoose";

export type StudentDocument = Document & {
  admin_id: Types.ObjectId;
  branch: number;
  fullname: string;
  profile_image?: string;
  blood_group: string;
  gender: string;
  birth_certificate_no: string;
  registration_date: Date;
  is_residential?: boolean;
  residential_category?: string;
  residential_fee?: number;
  is_day_care?: boolean;
  waiver_amount?: number;
  current_location: string;
  permanent_location: string;
  disable?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateStudentInput = {
  admin_id: string;
  branch: number;
  fullname: string;
  profile_image?: string;
  blood_group: string;
  gender: string;
  birth_certificate_no: string;
  registration_date: string;
  is_residential?: boolean;
  residential_category?: string;
  residential_fee?: number;
  is_day_care?: boolean;
  waiver_amount?: number;
  current_location: string;
  permanent_location: string;
  disable?: boolean;
};

export type CreateStudentPayload = {
  branch: number;
  profile_image?: string;
  full_name: string;
  blood_group: string;
  birth_certificate_no: string;
  gender: string;
  registration_date: string;
  section?: number;
  group?: number;
  class?: number;
  roll: number;
  current_location: string;
  permanent_location: string;
  day_care: boolean;
  residential: boolean;
  residential_category?: string;
  residential_fee?: number;
  waiver_amount?: number;
  class_fee: number;
  total?: number;
  guardian_name: string;
  guardian_relation: string;
  phone_number: string;
  alternative_phone_number?: string;
  guardian_current_location: string;
  guardian_permanent_location: string;
  disable?: boolean;
};

export type UpdateStudentPayload = CreateStudentPayload & {
  disable?: boolean;
};

export type StudentEnrollmentDocument = Document & {
  student_id: Types.ObjectId;
  group: number;
  section?: number;
  class?: number;
  roll: number;
  academic_year: number;
  fee: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateStudentEnrollmentInput = {
  student_id: string;
  group: number;
  section?: number;
  class?: number;
  roll: number;
  academic_year: number;
  fee: number;
};

export type StudentGuardianDocument = Document & {
  student_id: Types.ObjectId;
  guardian_name: string;
  guardian_relation: string;
  phone_number: string;
  current_location: string;
  permanent_location: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateStudentGuardianInput = {
  student_id: string;
  guardian_name: string;
  guardian_relation: string;
  phone_number: string;
  current_location: string;
  permanent_location: string;
};

export type StudentListItem = {
  _id: string;
  fullname: string;
  profile_image?: string;
  branch: number;
  is_residential: boolean;
  section?: number;
  class?: number;
  enrollment_years: number[];
  guardian: {
    name: string;
    phone: string;
  };
  disable?: boolean;
};

export type StudentDetails = {
  _id: string;
  branch: number;
  fullname: string;
  profile_image?: string;
  blood_group: string;
  gender: string;
  birth_certificate_no: string;
  registration_date: Date;
  is_residential: boolean;
  residential_category?: string;
  residential_fee: number;
  is_day_care: boolean;
  waiver_amount: number;
  current_location: string;
  permanent_location: string;
  disable?: boolean;
  enrollment: {
    group: number;
    section?: number;
    class?: number;
    roll: number;
    academic_year: number;
    fee: number;
  };
  guardian: {
    guardian_name: string;
    guardian_relation: string;
    phone_number: string;
    current_location: string;
    permanent_location: string;
  };
  createdAt: Date;
  updatedAt: Date;
};
