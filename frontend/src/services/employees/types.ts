export type CreateEmployeeInput = {
  branch: number;
  employment_type: number;
  designation: number;
  fullname: string;
  profile_image?: string;
  nid_no: string;
  gender: string;
  phone_number: string;
  join_date: string;
  resign_date?: string;
  salary: number;
  bonus?: number;
  current_location: string;
  permanent_location: string;
  disable?: boolean;
};

export type UpdateEmployeeInput = {
  branch?: number;
  employment_type?: number;
  designation?: number;
  fullname?: string;
  profile_image?: string;
  nid_no?: string;
  gender?: string;
  phone_number?: string;
  join_date?: string;
  resign_date?: string;
  salary?: number;
  bonus?: number;
  current_location?: string;
  permanent_location?: string;
  disable?: boolean;
};
