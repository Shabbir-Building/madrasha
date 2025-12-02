import { Branch } from '@/domain/branches/enums';
import { authOptions } from '@/lib/auth';
import { getDonationsByMonth, getIncomeExpenseComparison } from '@/services/analytics';
import { getServerSession } from 'next-auth';

import { DonationLineChart } from './_components/DonationLineChart';
import { IncomeExpenseChartBar } from './_components/IncomeExpenseChartBar';
import { SectionCards } from './_components/SectionCards';

type OverviewPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const OverviewPage = async ({ searchParams }: OverviewPageProps) => {
  const session = await getServerSession(authOptions);
  const accessToken = (session as typeof session & { accessToken?: string })?.accessToken;

  const branchParam = (() => {
    const param = searchParams?.branch;
    if (Array.isArray(param)) return param[0];
    return param;
  })();

  const selectedBranch: Branch | undefined = (() => {
    if (branchParam === 'boys') return Branch.BOYS;
    if (branchParam === 'girls') return Branch.GIRLS;
    if (branchParam == null || branchParam === 'all') return undefined;

    const parsed = Number.parseInt(branchParam, 10);
    if (parsed === Branch.BOYS || parsed === Branch.GIRLS) {
      return parsed as Branch;
    }

    return undefined;
  })();

  const [incomeExpenseData, donationsData] = await Promise.all([
    getIncomeExpenseComparison({
      accessToken,
      ...(selectedBranch != null ? { query: { branch: String(selectedBranch) } } : {}),
    }),
    getDonationsByMonth({
      accessToken,
      ...(selectedBranch != null ? { query: { branch: String(selectedBranch) } } : {}),
    }),
  ]);

  return (
    <>
      <SectionCards accessToken={accessToken} branch={selectedBranch} />
      <IncomeExpenseChartBar data={incomeExpenseData || []} />
      <DonationLineChart data={donationsData || []} />
    </>
  );
};

export default OverviewPage;
