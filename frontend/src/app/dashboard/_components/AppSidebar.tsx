'use client';

import { AdminRole } from '@/domain/admins';
import {
  BanknoteArrowDown,
  CircleDollarSign,
  HandCoins,
  LayoutDashboard,
  SquareUser,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import MadrasaLogo from '~/public/images/habrul ummah model madrasa logo.svg';

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import NavMain from './NavMain';
import { NavUser } from './NavUser';

const data = {
  navMain: [
    {
      title: 'Overview',
      url: '/dashboard/overview',
      icon: LayoutDashboard,
    },
    {
      title: 'Students',
      url: '/dashboard/students',
      icon: SquareUser,
    },
    {
      title: 'Employees',
      url: '/dashboard/employees',
      icon: Users,
    },
    {
      title: 'Income',
      url: '/dashboard/income',
      icon: CircleDollarSign,
    },
    {
      title: 'Donations',
      url: '/dashboard/donations',
      icon: HandCoins,
    },
    {
      title: 'Expenses',
      url: '/dashboard/expenses',
      icon: BanknoteArrowDown,
    },
    {
      title: 'Admins',
      url: '/dashboard/admins',
      icon: UserRoundCog,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const role = session?.admin?.role;

  const filteredNavMain = React.useMemo(() => {
    return data.navMain.filter((item) => {
      // Show everything to Super Admin
      if (role === AdminRole.SUPER_ADMIN) return true;

      // Hide Overview and Admins from non-super admins
      if (item.title === 'Overview' || item.title === 'Admins') {
        return false;
      }

      return true;
    });
  }, [role]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5 h-12">
              <Link href="/">
                <Image
                  src={MadrasaLogo}
                  alt="Habrul Ummah Madrasa Logo"
                  width={36}
                  height={36}
                  className="rounded-full object-contain"
                />
                <span className="text-base font-semibold">
                  Habrul Ummah <br /> Model Madrasah
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
