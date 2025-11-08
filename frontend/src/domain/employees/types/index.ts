import { Designation, EmployeeType } from '@/domain/employees/enums';

export type Employee = {
  _id: string;
  fullname: string;
  employment_type: EmployeeType;
  designation?: Designation;
  branch: string | number; // Can be number from API or string for display
  join_date: string;
  phone_number: string;
  nid_no?: string;
  gender?: string;
  profile_image?: string;
  salary?: number;
  bonus?: number;
  current_location?: string;
  permanent_location?: string;
  resign_date?: string;
  disable?: boolean;
};
