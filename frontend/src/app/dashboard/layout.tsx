import { Suspense } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { AppSidebar } from './_components/AppSidebar';
import { SiteHeader } from './_components/SiteHeader';

const DashbordLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 60)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Suspense fallback={<div className="h-(--header-height) shrink-0" />}>
          <SiteHeader />
        </Suspense>
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashbordLayout;
