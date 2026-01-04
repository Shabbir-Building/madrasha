'use client';

import { OverviewPrintModal } from '@/app/dashboard/_components/OverviewPrintModal';
import { BRANCH_MAP } from '@/domain/branches/constants';
import { getCurrentYear } from '@/lib/date-utils';
import { PrinterIcon } from 'lucide-react';

import { useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { ThemeToggle } from './ThemeToggle';

type BranchFilterValue = 'all' | 'boys' | 'girls';

const branchLabels: Record<BranchFilterValue, string> = {
  all: BRANCH_MAP[1],
  boys: BRANCH_MAP[2],
  girls: BRANCH_MAP[3],
};

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOverviewPage = pathname === '/dashboard/overview';

  // Generate year options (current year and previous 5 years)
  const currentYear = getCurrentYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // State for selected year (default to current year)
  const [selectedYear, setSelectedYear] = useState<number | 'all-years'>(currentYear);

  // State for print modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const branchParam = searchParams.get('branch');
  const selectedBranch: BranchFilterValue =
    branchParam === 'boys' || branchParam === 'girls' ? branchParam : 'all';

  const handleYearChange = (year: number | 'all-years') => {
    setSelectedYear(year);
  };

  const handleBranchChange = (branch: BranchFilterValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (branch === 'all') {
      params.delete('branch');
    } else {
      params.set('branch', branch);
    }

    const paramsString = params.toString();
    const nextPath = paramsString ? `${pathname}?${paramsString}` : pathname;
    router.replace(nextPath, { scroll: false });
  };

  const handlePrint = (startDate: Date, endDate: Date) => {
    // TODO: Implement additional print logic if needed
    console.log('Print:', { startDate, endDate });
  };

  const getDisplayText = () => {
    return selectedYear === 'all-years' ? 'All Years' : selectedYear.toString();
  };

  const getBranchDisplayText = () => branchLabels[selectedBranch];

  return (
    <header className="sticky top-0 z-10 bg-background rounded-t-xl flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 cursor-pointer" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">Overview</h1>
        <div className="ml-auto flex items-center gap-2">
          {isOverviewPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 px-3 bg-transparent">
                  {getDisplayText()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuCheckboxItem
                  checked={selectedYear === 'all'}
                  onCheckedChange={() => handleYearChange('all')}
                >
                  All Years
                </DropdownMenuCheckboxItem> */}
                {yearOptions.map((year) => (
                  <DropdownMenuCheckboxItem
                    key={year}
                    checked={selectedYear === year}
                    onCheckedChange={() => handleYearChange(year)}
                  >
                    {year}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isOverviewPage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 px-3 bg-transparent">
                  {getBranchDisplayText()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={selectedBranch === 'all'}
                  onCheckedChange={() => handleBranchChange('all')}
                >
                  {branchLabels.all}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedBranch === 'boys'}
                  onCheckedChange={() => handleBranchChange('boys')}
                >
                  {branchLabels.boys}
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={selectedBranch === 'girls'}
                  onCheckedChange={() => handleBranchChange('girls')}
                >
                  {branchLabels.girls}
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {isOverviewPage && (
            <>
              <Button
                variant="outline"
                className="h-8 px-3 bg-transparent"
                onClick={() => setIsPrintModalOpen(true)}
              >
                <PrinterIcon className="h-4 w-4" />
                Print
              </Button>
              <OverviewPrintModal
                open={isPrintModalOpen}
                onOpenChange={setIsPrintModalOpen}
                yearOptions={yearOptions}
                defaultYear={currentYear}
                defaultMonth={currentMonth}
                onPrint={handlePrint}
              />
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
