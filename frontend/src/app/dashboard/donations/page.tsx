import { authOptions } from '@/lib/auth';
import { getDonations } from '@/services/donation';
import { getServerSession } from 'next-auth';

import { DonationListTable, donationListTableColumns } from './_components/DonationListTable';

const DonationsPage = async () => {
  const session = await getServerSession(authOptions);
  const response = await getDonations({
    accessToken: (session as typeof session & { accessToken?: string })?.accessToken,
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
