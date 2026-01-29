import { authOptions } from '@/lib/auth';
import { getCurrentYear } from '@/lib/date-utils';
import { getIncomes } from '@/services/income';
import { getServerSession } from 'next-auth';

import { IncomeListTable, incomeListTableColumns } from './_components/IncomeListTable';

const IncomePage = async ({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; branch?: string; type?: string }>;
}) => {
  const session = await getServerSession(authOptions);
  const resolvedParams = await searchParams;
  const currentYear = getCurrentYear().toString();
  const year = resolvedParams.year ?? currentYear;
  const month = resolvedParams.month;
  const branch = resolvedParams.branch;
  const type = resolvedParams.type;

  const response = await getIncomes({
    accessToken: session?.accessToken,
    query: {
      year: year === 'all' ? undefined : year,
      month,
      branch,
      type,
    },
  });

  if (!response) return;

  return (
    <main className="container mx-auto">
      <IncomeListTable
        columns={incomeListTableColumns}
        data={response.docs}
        totalAmount={response.totalAmount}
        title="Income"
        admin={session?.admin}
      />
    </main>
  );
};

export default IncomePage;
