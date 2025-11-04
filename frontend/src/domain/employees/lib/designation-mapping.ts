import { Designation, EmployeeType } from '@/domain/employees/enums';

export const DESIGNATION_BY_EMPLOYEE_TYPE: Record<EmployeeType, Designation[]> = {
  [EmployeeType.ADMINISTRATION]: [
    Designation.CHAIRMAN,
    Designation.PRINCIPAL_HEAD_MUHTAMIM,
    Designation.VICE_PRINCIPAL_NAIB_MUHTAMIM,
    Designation.CO_ORDINATOR,
  ],
  [EmployeeType.TEACHER]: [
    Designation.HAFEZ,
    Designation.NURANI_TEACHER,
    Designation.ARABIC_TEACHER,
    Designation.GENERAL_TEACHER,
  ],
  [EmployeeType.MEDIA_IT]: [
    Designation.MEDIA_MANAGER,
    Designation.IT_MANAGER,
    Designation.DEVELOPER,
  ],
  [EmployeeType.STAFF]: [
    Designation.COOK,
    Designation.GATEKEEPER,
    Designation.DRIVER,
    Designation.CLEANER,
  ],
};
