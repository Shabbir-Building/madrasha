import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DonationReportData {
  date: string;
  sadaqah: number;
  zakat: number;
  membership: number;
  others: number;
}

export function generateDonationPDF(
  startDate: Date,
  endDate: Date,
  data: DonationReportData[],
) {
  // Create new PDF document
  const doc = new jsPDF();

  // Format date range for subtitle
  const startStr = dayjs(startDate).format('D-MMM-YYYY');
  const endStr = dayjs(endDate).format('D-MMM-YYYY');
  const rangeStr = `${startStr} to ${endStr}`;

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
  const subtitle = `Donation Report - ${rangeStr}`;
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 22);

  // Prepare table data
  const tableData = data.map((row, index) => {
    const formattedDate = dayjs(row.date).format('D-MMM-YYYY');
    return [
      (index + 1).toString(), // Sr. No.
      formattedDate,
      row.sadaqah.toLocaleString(),
      row.zakat.toLocaleString(),
      row.membership.toLocaleString(),
      row.others.toLocaleString(),
      (row.sadaqah + row.zakat + row.membership + row.others).toLocaleString(),
    ];
  });

  // Calculate grand totals
  const totalSadaqah = data.reduce((sum, row) => sum + row.sadaqah, 0);
  const totalZakat = data.reduce((sum, row) => sum + row.zakat, 0);
  const totalMembership = data.reduce((sum, row) => sum + row.membership, 0);
  const totalOthers = data.reduce((sum, row) => sum + row.others, 0);
  const grandTotal = totalSadaqah + totalZakat + totalMembership + totalOthers;

  // Add grand total row
  tableData.push([
    'Grand Total',
    '',
    totalSadaqah.toLocaleString(),
    totalZakat.toLocaleString(),
    totalMembership.toLocaleString(),
    totalOthers.toLocaleString(),
    grandTotal.toLocaleString(),
  ]);

  // Generate table
  autoTable(doc, {
    head: [['Sr. No.', 'Date', 'Sadaqah', 'Zakat', 'Membership', 'Others', 'Total']],
    body: tableData,
    startY: 28,
    theme: 'grid',
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
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
      2: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Sadaqah
      3: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Zakat
      4: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Membership
      5: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Others
      6: { halign: 'center', valign: 'middle', cellWidth: 'auto' }, // Total
    },
    didParseCell: (data) => {
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

export function printDonationPDF(
  startDate: Date,
  endDate: Date,
  data: DonationReportData[],
) {
  const doc = generateDonationPDF(startDate, endDate, data);

  const startFile = dayjs(startDate).format('YYYYMMDD');
  const endFile = dayjs(endDate).format('YYYYMMDD');
  const fileName = `donation-report-${startFile}-to-${endFile}.pdf`;

  doc.setProperties({
    title: `Donation Report - ${dayjs(startDate).format('D-MMM-YYYY')} to ${dayjs(endDate).format('D-MMM-YYYY')}`,
    subject: `Donation Report for the selected range`,
    author: 'Habrul Ummah Model Madrasah',
    creator: 'Habrul Ummah Model Madrasah',
  });

  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(pdfFile);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.title = fileName;

  document.body.appendChild(iframe);
  iframe.src = blobUrl;

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

  iframe.onload = () => {
    try {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) {
        cleanup();
        return;
      }

      iframeWindow.addEventListener('afterprint', () => {
        cleanup();
      });

      const fallbackTimeout = setTimeout(() => {
        cleanup();
      }, 600000);

      iframeWindow.focus();
      iframeWindow.print();

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

  iframe.onerror = () => {
    console.error('Error loading PDF in iframe');
    cleanup();
  };
}
