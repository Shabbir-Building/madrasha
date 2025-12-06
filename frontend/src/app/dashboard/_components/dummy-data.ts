export type DailyOverviewData = {
  date: string; // ISO format "YYYY-MM-DD"
  income: number;
  donation: number;
  expense: number;
  balance: number;
};

// Generate dummy data for a given month and year
export function generateDummyMonthData(year: number, month: number): DailyOverviewData[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const data: DailyOverviewData[] = [];
  
  let runningBalance = 0;
  
  for (let day = 1; day <= daysInMonth; day++) {
    const income = Math.floor(Math.random() * 5000) + 1000; // Random income between 1000-6000
    const donation = Math.floor(Math.random() * 3000) + 500; // Random donation between 500-3500
    const expense = Math.floor(Math.random() * 4000) + 800; // Random expense between 800-4800
    
    runningBalance = runningBalance + income + donation - expense;
    
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    data.push({
      date: dateStr,
      income,
      donation,
      expense,
      balance: runningBalance,
    });
  }
  
  return data;
}
