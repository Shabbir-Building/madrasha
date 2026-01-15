export type AdminProfile = {
  fullname: string;
  phone_number: string;
  role: number;
  permissions: {
    access_boys_section?: boolean;
    access_girls_section?: boolean;
  };
};

export type CreateAdminPayload = {
  employee_id: string;
  role?: number;
  access_boys_section: boolean;
  access_girls_section: boolean;
};

export type UpdateAdminPayload = {
  access_boys_section: boolean;
  access_girls_section: boolean;
};
