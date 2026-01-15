import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

import { AddEmployeeForm } from './_components/AddEmployeeForm';

export default async function AddEmployeePage() {
  const session = await getServerSession(authOptions);

  return <AddEmployeeForm admin={session?.admin} accessToken={(session as any)?.accessToken} />;
}
