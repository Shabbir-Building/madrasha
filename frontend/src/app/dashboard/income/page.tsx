import { authOptions } from '@/lib/auth';
import { getIncomes } from '@/services/income';
import { getServerSession } from 'next-auth';

import { IncomeListTable, incomeListTableColumns } from './_components/IncomeListTable';

const IncomePage = async () => {
  const session = await getServerSession(authOptions);
  const response = await getIncomes({
    accessToken: (session as typeof session & { accessToken?: string })?.accessToken,
  });

  if (!response) return;

  return (
    <main className="container mx-auto">
      <IncomeListTable
        columns={incomeListTableColumns}
        data={response.docs}
        title="Income"
        admin={session?.admin}
      />
    </main>
  );
};

export default IncomePage;
