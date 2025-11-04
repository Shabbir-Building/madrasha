import { Designation, EmployeeType } from '@/domain/employees/enums';

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  [EmployeeType.ADMINISTRATION]: 'Administration',
  [EmployeeType.TEACHER]: 'Teacher',
  [EmployeeType.MEDIA_IT]: 'Media & IT',
  [EmployeeType.STAFF]: 'Staff',
};

export const DESIGNATION_LABELS: Record<Designation, string> = {
  [Designation.PRINCIPAL_HEAD_MUHTAMIM]: 'Principal / Head (Muhtamim)',
  [Designation.VICE_PRINCIPAL_NAIB_MUHTAMIM]: 'Vice Principal / Naib Muhtamim',
  [Designation.OFFICE_ADMINISTRATOR]: 'Office Administrator',
  [Designation.ACCOUNTANT]: 'Accountant',
  [Designation.SUBJECT_TEACHER]: 'Subject Teacher',
  [Designation.GENERAL_SUBJECTS_TEACHER]: 'General Subjects Teacher',
  [Designation.HIFZ_TEACHER]: 'Hifz Teacher',
  [Designation.ASSISTANT_TEACHER]: 'Assistant Teacher',
  [Designation.MUALLIM]: "Mu'allim",
  [Designation.MUALLIMA]: "Mu'allima",
  [Designation.DEVELOPER]: 'Developer',
  [Designation.MEDIA_MANAGER]: 'Media Manager',
  [Designation.COMPUTER_OPERATOR]: 'Computer Operator',
  [Designation.PEON]: 'Peon',
  [Designation.LIBRARIAN]: 'Librarian',
  [Designation.DRIVER]: 'Driver',
  [Designation.COOK]: 'Cook',
  [Designation.EDUCATION_SECRETARY]: 'Education Secretary',
};
