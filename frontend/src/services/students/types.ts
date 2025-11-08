export type Student = {
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
  registration_date: string;
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
  createdAt: string;
  updatedAt: string;
};

export type CreateStudentInput = {
  branch: number;
  profile_image?: string;
  full_name: string;
  blood_group: string;
  birth_certificate_no: string;
  gender: string;
  registration_date: string;
  section?: number | null;
  group?: number | null;
  class?: number | null;
  roll: number;
  current_location: string;
  permanent_location: string;
  day_care: boolean;
  residential: boolean;
  residential_category?: string | null;
  residential_fee?: number | null;
  waiver_amount?: number | null;
  class_fee: number;
  total?: number | null;
  guardian_name: string;
  guardian_relation: string;
  phone_number: string;
  alternative_phone_number?: string | null;
  guardian_current_location: string;
  guardian_permanent_location: string;
  disable?: boolean;
};

export type UpdateStudentInput = CreateStudentInput & {
  disable?: boolean;
};
