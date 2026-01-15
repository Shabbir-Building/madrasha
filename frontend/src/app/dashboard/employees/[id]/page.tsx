import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

import { EmployeeDetailsForm } from '../_components/EmployeeDetailsForm';

export default async function EmployeeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  return (
    <EmployeeDetailsForm
      admin={session?.admin}
      accessToken={session?.accessToken}
      employeeId={id}
    />
  );
}
