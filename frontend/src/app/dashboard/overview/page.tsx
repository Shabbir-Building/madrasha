import { Branch } from '@/domain/branches/enums';
import { authOptions } from '@/lib/auth';
import { getCurrentYear } from '@/lib/date-utils';
import { getDonationsByMonth, getIncomeExpenseComparison } from '@/services/analytics';
import { getServerSession } from 'next-auth';

import { DonationLineChart } from './_components/DonationLineChart';
import { IncomeExpenseChartBar } from './_components/IncomeExpenseChartBar';
import { SectionCards } from './_components/SectionCards';

type OverviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const OverviewPage = async ({ searchParams }: OverviewPageProps) => {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  const resolvedSearchParams = await searchParams;

  const branchParam = (() => {
    const param = resolvedSearchParams?.branch;
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

  const yearParam = (() => {
    const param = resolvedSearchParams?.year;
    if (Array.isArray(param)) return param[0];
    return param;
  })();

  const selectedYear = yearParam ? Number.parseInt(yearParam, 10) : getCurrentYear();

  const [incomeExpenseData, donationsData] = await Promise.all([
    getIncomeExpenseComparison({
      accessToken,
      query: {
        ...(selectedBranch != null ? { branch: String(selectedBranch) } : {}),
        year: String(selectedYear),
      },
    }),
    getDonationsByMonth({
      accessToken,
      query: {
        ...(selectedBranch != null ? { branch: String(selectedBranch) } : {}),
        year: String(selectedYear),
      },
    }),
  ]);

  return (
    <>
      <SectionCards accessToken={accessToken} branch={selectedBranch} year={selectedYear} />
      <IncomeExpenseChartBar data={incomeExpenseData || []} year={selectedYear} />
      <DonationLineChart data={donationsData || []} year={selectedYear} />
    </>
  );
};

export default OverviewPage;
