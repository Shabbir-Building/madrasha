import { authOptions } from '@/lib/auth/options';
import { getServerSession } from 'next-auth';

import { AddStudentForm } from './_components/AddStudentForm';

export default async function AddStudentPage() {
  const session = await getServerSession(authOptions);

  return <AddStudentForm admin={session?.admin} accessToken={session?.accessToken} />;
}
