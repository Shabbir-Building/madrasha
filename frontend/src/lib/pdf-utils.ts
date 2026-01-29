import { Branch } from '@/domain/branches';
import { BRANCH_LABELS } from '@/domain/branches/lib/labels';
import { INCOME_TYPE_LABELS } from '@/domain/income/lib/labels';
import type { Income } from '@/services/income/types';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { formatDate } from './date-utils';

type FilterMetadata = {
  branchFilter?: number | '';
  typeFilter?: number | '';
  monthFilter?: string;
  yearFilter?: string;
  noteSearch?: string;
};

const buildIncomePDF = (
  doc: jsPDF,
  incomes: Income[],
  totalAmount: number,
  filters?: FilterMetadata,
): void => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Income Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Generation date/time
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const currentDate = dayjs().format('MMMM DD, YYYY [at] hh:mm A');
  doc.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Filter information
  if (filters) {
    const filterLabels: string[] = [];
    if (filters.branchFilter) {
      filterLabels.push(`Branch: ${BRANCH_LABELS[filters.branchFilter as Branch]}`);
    }
    if (filters.typeFilter) {
      filterLabels.push(
        `Type: ${INCOME_TYPE_LABELS[filters.typeFilter as keyof typeof INCOME_TYPE_LABELS]}`,
      );
    }
    if (filters.monthFilter) {
      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      filterLabels.push(`Month: ${monthNames[Number.parseInt(filters.monthFilter) - 1]}`);
    }
    if (filters.yearFilter) {
      filterLabels.push(`Year: ${filters.yearFilter}`);
    }
    if (filters.noteSearch) {
      filterLabels.push(`Search: "${filters.noteSearch}"`);
    }

    if (filterLabels.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Filters: ${filterLabels.join(' | ')}`, pageWidth / 2, yPosition, {
        align: 'center',
      });
      doc.setTextColor(0, 0, 0);
      yPosition += 6;
    }
  }

  // Summary
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Records: ${incomes.length}`, 14, yPosition);
  doc.text(`Total Amount: ৳${totalAmount.toLocaleString()}`, pageWidth - 14, yPosition, {
    align: 'right',
  });
  yPosition += 10;

  // Table data preparation
  const tableData = incomes.map((income) => {
    const typeLabel =
      INCOME_TYPE_LABELS[income.type as keyof typeof INCOME_TYPE_LABELS] || 'Unknown';
    const branchLabel = BRANCH_LABELS[income.branch as Branch] || 'Unknown';
    const addedBy = income.admin_id?.employee_id?.fullname || 'Unknown';
    const formattedDate =
      formatDate(income.income_date) || dayjs(income.income_date).format('MM/DD/YYYY');
    const formattedAmount = `৳${income.amount.toLocaleString()}`;

    return [typeLabel, income.notes, branchLabel, addedBy, formattedDate, formattedAmount];
  });

  // Table columns
  const columns = ['Type', 'Note', 'Branch', 'Added By', 'Date', 'Amount'];

  // Generate table
  autoTable(doc, {
    head: [columns],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [71, 85, 105],
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 25, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 14, right: 14 },
  });

  // Get final Y position after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 20;

  // Footer with total
  if (finalY < pageHeight - 30) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.line(14, finalY + 5, pageWidth - 14, finalY + 5);
    doc.text(`Grand Total: ৳${totalAmount.toLocaleString()}`, pageWidth - 14, finalY + 12, {
      align: 'right',
    });
  }

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    });
    doc.setTextColor(0, 0, 0);
  }
};

export const generateIncomePDFBlob = (
  incomes: Income[],
  totalAmount: number,
  filters?: FilterMetadata,
): string => {
  const doc = new jsPDF();
  buildIncomePDF(doc, incomes, totalAmount, filters);

  // Generate PDF blob and return object URL
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  return url;
};

export const generateIncomePDF = (
  incomes: Income[],
  totalAmount: number,
  filters?: FilterMetadata,
): void => {
  const doc = new jsPDF();
  buildIncomePDF(doc, incomes, totalAmount, filters);

  // Generate filename
  const timestamp = dayjs().format('YYYY-MM-DD-HHmmss');
  const filename = `income-report-${timestamp}.pdf`;

  // Save PDF
  doc.save(filename);
};
