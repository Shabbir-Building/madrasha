export type DailyOverviewData = {
  date: string; // ISO format "YYYY-MM-DD"
  income: number;
  donation: number;
  expense: number;
  balance: number;
};

// Generate dummy data for a given date range
export function generateDummyRangeData(startDate: Date, endDate: Date): DailyOverviewData[] {
  const data: DailyOverviewData[] = [];
  let current = new Date(startDate);
  let runningBalance = 0;

  while (current <= endDate) {
    const income = Math.floor(Math.random() * 5000) + 1000;
    const donation = Math.floor(Math.random() * 3000) + 500;
    const expense = Math.floor(Math.random() * 4000) + 800;

    runningBalance = runningBalance + income + donation - expense;

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    data.push({
      date: dateStr,
      income,
      donation,
      expense,
      balance: runningBalance,
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}

// Keep for backward compatibility
export function generateDummyMonthData(year: number, month: number): DailyOverviewData[] {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return generateDummyRangeData(start, end);
}
