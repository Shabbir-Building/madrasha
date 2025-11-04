import { Designation, EmployeeType } from '@/domain/employees/enums';

export const DESIGNATION_BY_EMPLOYEE_TYPE: Record<EmployeeType, Designation[]> = {
  [EmployeeType.ADMINISTRATION]: [
    Designation.PRINCIPAL_HEAD_MUHTAMIM,
    Designation.VICE_PRINCIPAL_NAIB_MUHTAMIM,
    Designation.EDUCATION_SECRETARY,
    Designation.OFFICE_ADMINISTRATOR,
    Designation.ACCOUNTANT,
  ],
  [EmployeeType.TEACHER]: [
    Designation.SUBJECT_TEACHER,
    Designation.GENERAL_SUBJECTS_TEACHER,
    Designation.HIFZ_TEACHER,
    Designation.ASSISTANT_TEACHER,
    Designation.MUALLIM,
    Designation.MUALLIMA,
  ],
  [EmployeeType.MEDIA_IT]: [
    Designation.DEVELOPER,
    Designation.MEDIA_MANAGER,
    Designation.COMPUTER_OPERATOR,
  ],
  [EmployeeType.STAFF]: [
    Designation.PEON,
    Designation.LIBRARIAN,
    Designation.DRIVER,
    Designation.COOK,
  ],
};
