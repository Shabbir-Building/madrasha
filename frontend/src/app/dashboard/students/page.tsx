import { authOptions } from '@/lib/auth';
import { getStudents } from '@/services/students';
import { getServerSession } from 'next-auth';

import { StudentListTable, studentListTableColumns } from './_components/StudentListTable';

const StudentsPage = async () => {
  const session = await getServerSession(authOptions);
  const response = await getStudents({
    accessToken: session?.accessToken,
  });

  if (!response) return;

  const students = response.docs.filter((student) => !student.disable);

  return (
    <main className="container mx-auto">
      <StudentListTable
        columns={studentListTableColumns}
        data={students}
        title="Students"
        admin={session?.admin}
      />
    </main>
  );
};

export default StudentsPage;
