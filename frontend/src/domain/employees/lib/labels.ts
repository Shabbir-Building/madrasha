import { Designation, EmployeeType } from '@/domain/employees/enums';

export const EMPLOYEE_TYPE_LABELS: Record<EmployeeType, string> = {
  [EmployeeType.ADMINISTRATION]: 'Administration',
  [EmployeeType.TEACHER]: 'Teacher',
  [EmployeeType.MEDIA_IT]: 'Media & IT',
  [EmployeeType.STAFF]: 'Staff',
};

export const DESIGNATION_LABELS: Record<Designation, string> = {
  [Designation.CHAIRMAN]: 'Chairman',
  [Designation.PRINCIPAL_HEAD_MUHTAMIM]: 'Principal / Head (Muhtamim)',
  [Designation.VICE_PRINCIPAL_NAIB_MUHTAMIM]: 'Vice Principal / Naib Muhtamim',
  [Designation.CO_ORDINATOR]: 'Co-Ordinator',
  [Designation.HAFEZ]: 'Hafez',
  [Designation.NURANI_TEACHER]: 'Nurani Teacher',
  [Designation.ARABIC_TEACHER]: 'Arabic Teacher',
  [Designation.GENERAL_TEACHER]: 'General Teacher',
  [Designation.MEDIA_MANAGER]: 'Media Manager',
  [Designation.IT_MANAGER]: 'IT Manager',
  [Designation.DEVELOPER]: 'Developer',
  [Designation.COOK]: 'Cook',
  [Designation.GATEKEEPER]: 'Gatekeeper',
  [Designation.DRIVER]: 'Driver',
  [Designation.CLEANER]: 'Cleaner',
};
