export type OverviewStats = {
  totalIncome: number;
  totalDonations: number;
  totalExpense: number;
  currentBalance: number;
};

export type MonthlyIncomeExpense = {
  month: string;
  income: number;
  expense: number;
};

export type MonthlyDonations = {
  month: string;
  sadaqah: number;
  zakat: number;
  membership: number;
  others: number;
};

export type DailyOverviewData = {
  date: string; // ISO format "YYYY-MM-DD"
  income: number;
  donation: number;
  expense: number;
  balance: number;
};

export type IncomeReportItem = {
  date: string;
  admissionFee: number;
  sessionFee: number;
  monthlyFee: number;
  canteen: number;
  others: number;
};

export type ExpenseReportItem = {
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
};

export type DonationReportItem = {
  date: string;
  sadaqah: number;
  zakat: number;
  membership: number;
  others: number;
};
