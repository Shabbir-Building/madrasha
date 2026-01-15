import { authOptions } from '@/lib/auth';
import { getExpenses } from '@/services/expense';
import { getServerSession } from 'next-auth';

import { ExpenseListTable, expenseListTableColumns } from './_components/ExpenseListTable';

const ExpensesPage = async () => {
  const session = await getServerSession(authOptions);
  const response = await getExpenses({
    accessToken: (session as typeof session & { accessToken?: string })?.accessToken,
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
