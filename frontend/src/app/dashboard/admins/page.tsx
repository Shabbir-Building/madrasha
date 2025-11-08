import { AdminRole } from '@/domain/admins/enums';
import { ADMIN_ROLE_LABELS } from '@/domain/admins/lib';
import { authOptions } from '@/lib/auth';
import { getAdmins } from '@/services/admins';
import { getServerSession } from 'next-auth';

import { AdminListTable, adminListTableColumns } from './_components/AdminListTable';

const AdminsListPage = async () => {
  const session = await getServerSession(authOptions);
  const response = await getAdmins({
    accessToken: (session as typeof session & { accessToken?: string })?.accessToken,
  });

  const admins = (response?.docs || [])
    .filter((a) => !a.disable)
    .map((a) => ({
      id: a._id,
      name: a.fullname,
      type: ADMIN_ROLE_LABELS[a.role as AdminRole],
      phone: a.phone_number,
      access_boys_section: a.access_boys_section,
      access_girls_section: a.access_girls_section,
      adminSince: new Date(a.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    }));

  return (
    <AdminListTable
      columns={adminListTableColumns}
      data={admins}
      title={`Admins (${admins.length})`}
      description="Manage your admin users and their permissions"
    />
  );
};

export default AdminsListPage;
