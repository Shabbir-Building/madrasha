import { type Document } from "mongoose";

export type EmployeeDocument = Document & {
  branch: number;
  employment_type: number;
  designation: number;
  fullname: string;
  profile_image?: string;
  nid_no: string;
  gender: string;
  phone_number: string;
  join_date: Date;
  resign_date?: Date;
  salary: number;
  bonus: number;
  current_location: string;
  permanent_location: string;
  disable?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

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

export type EmployeeListItem = {
  _id: string;
  fullname: string;
  employment_type: number;
  designation?: number;
  branch: number;
  join_date: Date;
  phone_number: string;
};

export type EmployeeDetails = {
  _id: string;
  branch: number;
  employment_type: number;
  designation: number;
  fullname: string;
  profile_image?: string;
  nid_no: string;
  gender: string;
  phone_number: string;
  join_date: Date;
  resign_date?: Date;
  salary: number;
  bonus: number;
  current_location: string;
  permanent_location: string;
  disable?: boolean;
  createdAt: Date;
  updatedAt: Date;
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
