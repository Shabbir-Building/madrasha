import { authOptions } from '@/lib/auth';
import { getCurrentYear } from '@/lib/date-utils';
import { getExpenses } from '@/services/expense';
import { getServerSession } from 'next-auth';

import { ExpenseListTable, expenseListTableColumns } from './_components/ExpenseListTable';

const ExpensesPage = async ({
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

  const response = await getExpenses({
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
      <ExpenseListTable
        columns={expenseListTableColumns}
        data={response.docs}
        title="Expenses"
        admin={session?.admin}
      />
    </main>
  );
};

export default ExpensesPage;
