import { authOptions } from '@/lib/auth';
import { getEmployees } from '@/services/employees';
import { getServerSession } from 'next-auth';

import { EmployeeListTable, employeeListTableColumns } from './_components/EmployeeListTable';

const EmployesPage = async () => {
  const session = await getServerSession(authOptions);
  const response = await getEmployees({
    accessToken: session?.accessToken,
  });

  if (!response) return;

  const employees = response.docs.filter((employee) => !employee.disable);

  return (
    <EmployeeListTable
      columns={employeeListTableColumns}
      data={employees}
      title="Employees"
      admin={session?.admin}
    />
  );
};

export default EmployesPage;
