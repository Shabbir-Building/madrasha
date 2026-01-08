import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExpenseReportData {
  date: string;
  salary: number;
  hostel: number;
  electricBill: number;
  mobileInternetBill: number;
  office: number;
  stationery: number;
  utilities: number;
  fare: number;
  maintenance: number;
  construction: number;
}

export function generateExpensePDF(startDate: Date, endDate: Date, data: ExpenseReportData[]) {
  // Create new PDF document
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

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
  const subtitle = `Expense Report - ${rangeStr}`;
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, 22);

  // Prepare table data
  const tableData = data.map((row, index) => {
    const formattedDate = dayjs(row.date).format('D-MMM-YYYY');
    return [
      (index + 1).toString(), // Sr. No.
      formattedDate,
      row.salary.toLocaleString(),
      row.hostel.toLocaleString(),
      row.electricBill.toLocaleString(),
      row.mobileInternetBill.toLocaleString(),
      row.office.toLocaleString(),
      row.stationery.toLocaleString(),
      row.utilities.toLocaleString(),
      row.fare.toLocaleString(),
      row.maintenance.toLocaleString(),
      row.construction.toLocaleString(),
      (
        row.salary +
        row.hostel +
        row.electricBill +
        row.mobileInternetBill +
        row.office +
        row.stationery +
        row.utilities +
        row.fare +
        row.maintenance +
        row.construction
      ).toLocaleString(),
    ];
  });

  // Calculate grand totals
  const totalSalary = data.reduce((sum, row) => sum + row.salary, 0);
  const totalHostel = data.reduce((sum, row) => sum + row.hostel, 0);
  const totalElectric = data.reduce((sum, row) => sum + row.electricBill, 0);
  const totalMobile = data.reduce((sum, row) => sum + row.mobileInternetBill, 0);
  const totalOffice = data.reduce((sum, row) => sum + row.office, 0);
  const totalStationery = data.reduce((sum, row) => sum + row.stationery, 0);
  const totalUtilities = data.reduce((sum, row) => sum + row.utilities, 0);
  const totalFare = data.reduce((sum, row) => sum + row.fare, 0);
  const totalMaintenance = data.reduce((sum, row) => sum + row.maintenance, 0);
  const totalConstruction = data.reduce((sum, row) => sum + row.construction, 0);

  const grandTotal =
    totalSalary +
    totalHostel +
    totalElectric +
    totalMobile +
    totalOffice +
    totalStationery +
    totalUtilities +
    totalFare +
    totalMaintenance +
    totalConstruction;

  // Add grand total row
  tableData.push([
    'Grand Total',
    '',
    totalSalary.toLocaleString(),
    totalHostel.toLocaleString(),
    totalElectric.toLocaleString(),
    totalMobile.toLocaleString(),
    totalOffice.toLocaleString(),
    totalStationery.toLocaleString(),
    totalUtilities.toLocaleString(),
    totalFare.toLocaleString(),
    totalMaintenance.toLocaleString(),
    totalConstruction.toLocaleString(),
    grandTotal.toLocaleString(),
  ]);

  // Generate table
  autoTable(doc, {
    head: [
      [
        'Sr. No.',
        'Date',
        'Salary',
        'Hostel',
        'Electric Bill',
        'Mobile & Internet',
        'Office',
        'Stationery',
        'Utilities',
        'Fare',
        'Maintenance',
        'Construction',
        'Total',
      ],
    ],
    body: tableData,
    startY: 28,
    theme: 'grid',
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
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
      fontSize: 8,
      cellPadding: 1.5,
    },
    bodyStyles: {
      halign: 'center',
      valign: 'middle',
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

export function printExpensePDF(startDate: Date, endDate: Date, data: ExpenseReportData[]) {
  const doc = generateExpensePDF(startDate, endDate, data);

  const startFile = dayjs(startDate).format('YYYYMMDD');
  const endFile = dayjs(endDate).format('YYYYMMDD');
  const fileName = `expense-report-${startFile}-to-${endFile}.pdf`;

  doc.setProperties({
    title: `Expense Report - ${dayjs(startDate).format('D-MMM-YYYY')} to ${dayjs(endDate).format('D-MMM-YYYY')}`,
    subject: `Expense Report for the selected range`,
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
