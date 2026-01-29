import { authOptions } from '@/lib/auth';
import { getCurrentYear } from '@/lib/date-utils';
import { getDonations } from '@/services/donation';
import { getServerSession } from 'next-auth';

import { DonationListTable, donationListTableColumns } from './_components/DonationListTable';

const DonationsPage = async ({
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

  const response = await getDonations({
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
      <DonationListTable
        columns={donationListTableColumns}
        data={response.docs}
        title="Donations"
        admin={session?.admin}
      />
    </main>
  );
};

export default DonationsPage;
