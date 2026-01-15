'use client';

import { type AdminProfile, AdminRole } from '@/domain/admins';
import { BRANCH_LABELS, Branch } from '@/domain/branches';
import {
  STUDENT_CLASS_LABELS,
  STUDENT_SECTION_LABELS,
  StudentClass,
  StudentSection,
} from '@/domain/students';
import type { Student } from '@/services/students/types';
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Plus } from 'lucide-react';

import * as React from 'react';

import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StudentListTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  description?: string;
  admin?: AdminProfile;
}

export function StudentListTable<TData, TValue>({
  columns,
  data,
  title = 'Students',
  admin,
}: StudentListTableProps<TData, TValue>) {
  const isSuperAdmin = admin?.role === AdminRole.SUPER_ADMIN;
  const canAccessBoys = isSuperAdmin || admin?.permissions?.access_boys_section;
  const canAccessGirls = isSuperAdmin || admin?.permissions?.access_girls_section;
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [nameSearch, setNameSearch] = React.useState<string>('');
  const [branchFilter, setBranchFilter] = React.useState<number | null>(() => {
    if (admin) {
      if (canAccessBoys && !canAccessGirls) {
        return Branch.BOYS;
      } else if (!canAccessBoys && canAccessGirls) {
        return Branch.GIRLS;
      }
    }
    return null;
  });

  const [sectionFilter, setSectionFilter] = React.useState<number | null>(null);
  const [classFilter, setClassFilter] = React.useState<number | null>(null);
  const [yearFilter, setYearFilter] = React.useState<string>('');

  const filteredData = React.useMemo(() => {
    let filtered = data as Student[];

    filtered = filtered.filter((student) => !student.disable);

    // Initial section-based filtering for non-super admins
    if (!isSuperAdmin) {
      filtered = filtered.filter((student) => {
        if (student.branch === Branch.BOYS) return canAccessBoys;
        if (student.branch === Branch.GIRLS) return canAccessGirls;
        return true; // Fallback for any other branches if they exist
      });
    }

    if (nameSearch) {
      filtered = filtered.filter((student) =>
        student.fullname.toLowerCase().includes(nameSearch.toLowerCase()),
      );
    }

    if (branchFilter !== null) {
      filtered = filtered.filter((student) => student.branch === branchFilter);
    }
    if (sectionFilter !== null) {
      filtered = filtered.filter((student) => student.section === sectionFilter);
    }
    if (classFilter !== null) {
      filtered = filtered.filter((student) => student.class === classFilter);
    }
    if (yearFilter) {
      filtered = filtered.filter((student) =>
        student.enrollment_years.includes(Number.parseInt(yearFilter)),
      );
    }

    return filtered as TData[];
  }, [data, nameSearch, branchFilter, sectionFilter, classFilter, yearFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
    state: {
      columnFilters,
    },
  });

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {title} ({filteredData.length})
        </h2>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Input
              placeholder="Search students..."
              value={nameSearch}
              onChange={(event) => setNameSearch(event.target.value)}
              className="h-9 w-64"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 px-3 bg-transparent">
                {branchFilter !== null ? BRANCH_LABELS[branchFilter as Branch] : 'Branches'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={branchFilter === null}
                onCheckedChange={() => setBranchFilter(null)}
              >
                All Branches
              </DropdownMenuCheckboxItem>
              {canAccessBoys && (
                <DropdownMenuCheckboxItem
                  checked={branchFilter === Branch.BOYS}
                  onCheckedChange={() =>
                    setBranchFilter(branchFilter === Branch.BOYS ? null : Branch.BOYS)
                  }
                >
                  {BRANCH_LABELS[Branch.BOYS]}
                </DropdownMenuCheckboxItem>
              )}
              {canAccessGirls && (
                <DropdownMenuCheckboxItem
                  checked={branchFilter === Branch.GIRLS}
                  onCheckedChange={() =>
                    setBranchFilter(branchFilter === Branch.GIRLS ? null : Branch.GIRLS)
                  }
                >
                  {BRANCH_LABELS[Branch.GIRLS]}
                </DropdownMenuCheckboxItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 px-3 bg-transparent">
                {sectionFilter !== null
                  ? STUDENT_SECTION_LABELS[sectionFilter as StudentSection]
                  : 'Sections'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sectionFilter === null}
                onCheckedChange={() => setSectionFilter(null)}
              >
                All Sections
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sectionFilter === StudentSection.NAJERA}
                onCheckedChange={() =>
                  setSectionFilter(
                    sectionFilter === StudentSection.NAJERA ? null : StudentSection.NAJERA,
                  )
                }
              >
                {STUDENT_SECTION_LABELS[StudentSection.NAJERA]}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sectionFilter === StudentSection.HIFZ}
                onCheckedChange={() =>
                  setSectionFilter(
                    sectionFilter === StudentSection.HIFZ ? null : StudentSection.HIFZ,
                  )
                }
              >
                {STUDENT_SECTION_LABELS[StudentSection.HIFZ]}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sectionFilter === StudentSection.NURANI}
                onCheckedChange={() =>
                  setSectionFilter(
                    sectionFilter === StudentSection.NURANI ? null : StudentSection.NURANI,
                  )
                }
              >
                {STUDENT_SECTION_LABELS[StudentSection.NURANI]}
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sectionFilter === StudentSection.KITAB}
                onCheckedChange={() =>
                  setSectionFilter(
                    sectionFilter === StudentSection.KITAB ? null : StudentSection.KITAB,
                  )
                }
              >
                {STUDENT_SECTION_LABELS[StudentSection.KITAB]}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 px-3 bg-transparent">
                {classFilter !== null
                  ? STUDENT_CLASS_LABELS[classFilter as StudentClass]
                  : 'Classes'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={classFilter === null}
                onCheckedChange={() => setClassFilter(null)}
              >
                All Classes
              </DropdownMenuCheckboxItem>
              {Object.entries(STUDENT_CLASS_LABELS).map(([value, label]) => {
                const classValue = Number.parseInt(value) as StudentClass;
                return (
                  <DropdownMenuCheckboxItem
                    key={value}
                    checked={classFilter === classValue}
                    onCheckedChange={() =>
                      setClassFilter(classFilter === classValue ? null : classValue)
                    }
                  >
                    {label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 px-3 bg-transparent">
                {yearFilter || 'Year'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={!yearFilter}
                onCheckedChange={() => setYearFilter('')}
              >
                All Years
              </DropdownMenuCheckboxItem>
              {['2025', '2024', '2023', '2022'].map((year) => (
                <DropdownMenuCheckboxItem
                  key={year}
                  checked={yearFilter === year}
                  onCheckedChange={() => setYearFilter(yearFilter === year ? '' : year)}
                >
                  {year}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button className="h-9 px-3" asChild>
            <Link href="/dashboard/add-student">
              <Plus className="h-4 w-4" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b bg-muted/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-b transition-colors hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} result(s).
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export const studentListTableColumns: ColumnDef<Student>[] = [
  {
    accessorKey: 'fullname',
    header: 'Name',
    cell: ({ row }) => {
      const student = row.original;
      const initials = student.fullname
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={student.profile_image || '/placeholder.svg'} alt={student.fullname} />
            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{student.fullname}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'section',
    header: 'Section',
    cell: ({ row }) => {
      const section = row.getValue('section') as number | undefined;
      return (
        <div className="text-sm">
          {section ? STUDENT_SECTION_LABELS[section as StudentSection] : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'class',
    header: 'Class',
    cell: ({ row }) => {
      const classValue = row.getValue('class') as number | undefined;
      return (
        <div className="text-sm">
          {classValue ? STUDENT_CLASS_LABELS[classValue as StudentClass] : '-'}
        </div>
      );
    },
  },
  {
    accessorKey: 'guardian',
    header: 'Guardian Name',
    cell: ({ row }) => {
      const guardian = row.getValue('guardian') as Student['guardian'];
      return <div className="font-medium">{guardian?.name || '-'}</div>;
    },
  },
  {
    accessorKey: 'guardian.phone',
    header: 'Phone',
    cell: ({ row }) => {
      const guardian = row.getValue('guardian') as Student['guardian'];
      return <div className="font-mono text-sm">{guardian?.phone || '-'}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    header: 'Action',
    cell: ({ row }) => {
      const student = row.original;
      return (
        <Link href={`/dashboard/students/${student._id}`}>
          <Button variant="link" className="h-auto p-0 text-sm text-primary underline">
            Details
          </Button>
        </Link>
      );
    },
  },
];
