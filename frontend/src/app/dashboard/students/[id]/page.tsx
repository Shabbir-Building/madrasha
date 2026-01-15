import { authOptions } from '@/lib/auth/options';
import { getServerSession } from 'next-auth';

import { StudentDetailsForm } from '../_components/StudentDetailsForm';

export default async function StudentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  return (
    <StudentDetailsForm admin={session?.admin} accessToken={session?.accessToken} studentId={id} />
  );
}
