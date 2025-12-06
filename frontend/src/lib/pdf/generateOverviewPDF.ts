import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { DailyOverviewData } from '@/app/dashboard/_components/dummy-data';

export function generateOverviewPDF(year: string, month: string, data: DailyOverviewData[]) {
  // Create new PDF document
  const doc = new jsPDF();

  // Get month name
  const monthName = dayjs(`${year}-${month}-01`).format('MMMM');

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add printing date at top right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const printDate = dayjs().format('DD-MMM-YYYY');
  const printDateText = `Print Date: ${printDate}`;
  const printDateWidth = doc.getTextWidth(printDateText);
  doc.text(printDateText, pageWidth - printDateWidth - 10, 15);
  
  // Add main title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const title = 'Habrul Ummah Model Madrasah';
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 15);

  // Add subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const subtitle = `Monthly Total Overview - ${monthName} ${year}`;
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 22);

  // Prepare table data
  const tableData = data.map((row, index) => {
    const formattedDate = dayjs(row.date).format('D-MMM-YYYY');
    return [
      (index + 1).toString(), // Serial number
      formattedDate,
      row.income.toLocaleString(),
      row.donation.toLocaleString(),
      row.expense.toLocaleString(),
      row.balance.toLocaleString(),
    ];
  });

  // Calculate grand totals
  const totalIncome = data.reduce((sum, row) => sum + row.income, 0);
  const totalDonation = data.reduce((sum, row) => sum + row.donation, 0);
  const totalExpense = data.reduce((sum, row) => sum + row.expense, 0);
  const finalBalance = data[data.length - 1]?.balance || 0;

  // Add grand total row
  tableData.push([
    'Grand Total',
    '',
    totalIncome.toLocaleString(),
    totalDonation.toLocaleString(),
    totalExpense.toLocaleString(),
    finalBalance.toLocaleString(),
  ]);

  // Generate table
  autoTable(doc, {
    head: [['Sr. No.', 'Date', 'Total Income', 'Total Donations', 'Total Expense', 'Current Balance']],
    body: tableData,
    startY: 28,
    theme: 'grid',
    margin: { left: 10, right: 10 }, // Add padding on both sides
    tableWidth: 'auto', // Use full available width
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [200, 200, 200],
      lineWidth: 0.1,
      halign: 'center',
      valign: 'middle',
    },
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 9,
      cellPadding: 2,
      minCellHeight: 6,
    },
    bodyStyles: {
      halign: 'center',
      valign: 'middle',
      minCellHeight: 5,
    },
    columnStyles: {
      0: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Sr. No.
      1: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Date
      2: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Income
      3: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Donations
      4: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Expense
      5: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Balance
    },
    didParseCell: (data) => {
      // Style the grand total row
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
  });

  return doc;
}

export function printOverviewPDF(year: string, month: string, data: DailyOverviewData[]) {
  // Generate the PDF document
  const doc = generateOverviewPDF(year, month, data);
  
  // Get month name for filename
  const monthName = dayjs(`${year}-${month}-01`).format('MMMM');
  const fileName = `overview-${monthName.toLowerCase()}-${year}.pdf`;
  
  // Set PDF metadata
  doc.setProperties({
    title: `Monthly Overview - ${monthName} ${year}`,
    subject: `Monthly Total Overview for ${monthName} ${year}`,
    author: 'Habrul Ummah Model Madrasah',
    creator: 'Habrul Ummah Model Madrasah',
  });
  
  // Get the PDF as a blob
  const pdfBlob = doc.output('blob');
  
  // Create a File object with the proper filename
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
  
  // Create a blob URL from the File
  const blobUrl = URL.createObjectURL(pdfFile);
  
  // Create a hidden iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.title = fileName; // Set iframe title to filename
  
  // Add iframe to document
  document.body.appendChild(iframe);
  
  // Set the iframe source to the PDF blob URL
  iframe.src = blobUrl;
  
  // Cleanup function
  const cleanup = () => {
    try {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };
  
  // Wait for iframe to load, then trigger print
  iframe.onload = () => {
    try {
      const iframeWindow = iframe.contentWindow;
      
      if (!iframeWindow) {
        cleanup();
        return;
      }
      
      // Listen for afterprint event to cleanup after printing
      iframeWindow.addEventListener('afterprint', () => {
        cleanup();
      });
      
      // Fallback: cleanup after 10 minutes if afterprint doesn't fire
      const fallbackTimeout = setTimeout(() => {
        cleanup();
      }, 600000); // 10 minutes
      
      // Focus the iframe and trigger print
      iframeWindow.focus();
      iframeWindow.print();
      
      // If print is cancelled immediately, cleanup
      setTimeout(() => {
        if (!document.body.contains(iframe)) {
          clearTimeout(fallbackTimeout);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error printing:', error);
      cleanup();
    }
  };
  
  // Error handler
  iframe.onerror = () => {
    console.error('Error loading PDF in iframe');
    cleanup();
  };
}
