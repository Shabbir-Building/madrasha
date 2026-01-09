import { type CacheConfig, type FetchOptions, serverGet } from '@/services/api';

import type {
  DailyOverviewData,
  DonationReportItem,
  ExpenseReportItem,
  IncomeReportItem,
  MonthlyDonations,
  MonthlyIncomeExpense,
  OverviewStats,
} from './types';

const getOverviewStats = async (fetchOptions?: FetchOptions, cacheConfig?: CacheConfig) => {
  const response = await serverGet<OverviewStats>(
    '/analytics/overview-stats',
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

const getIncomeExpenseComparison = async (
  fetchOptions?: FetchOptions,
  cacheConfig?: CacheConfig,
) => {
  const response = await serverGet<MonthlyIncomeExpense[]>(
    '/analytics/income-expense-comparison',
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

const getDonationsByMonth = async (fetchOptions?: FetchOptions, cacheConfig?: CacheConfig) => {
  const response = await serverGet<MonthlyDonations[]>(
    '/analytics/donations-by-month',
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

const getReportOverview = async (
  startDate: string,
  endDate: string,
  fetchOptions?: FetchOptions,
  cacheConfig?: CacheConfig,
) => {
  const response = await serverGet<DailyOverviewData[]>(
    `/analytics/report-overview?startDate=${startDate}&endDate=${endDate}`,
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

const getIncomeReport = async (
  startDate: string,
  endDate: string,
  fetchOptions?: FetchOptions,
  cacheConfig?: CacheConfig,
) => {
  const response = await serverGet<IncomeReportItem[]>(
    `/analytics/income-report?startDate=${startDate}&endDate=${endDate}`,
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

export {
  getOverviewStats,
  getIncomeExpenseComparison,
  getDonationsByMonth,
  getReportOverview,
  getIncomeReport,
};

export const getExpenseReport = async (
  startDate: string,
  endDate: string,
  fetchOptions?: FetchOptions,
  cacheConfig?: CacheConfig,
) => {
  const response = await serverGet<ExpenseReportItem[]>(
    `/analytics/expense-report?startDate=${startDate}&endDate=${endDate}`,
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

export const getDonationReport = async (
  startDate: string,
  endDate: string,
  fetchOptions?: FetchOptions,
  cacheConfig?: CacheConfig,
) => {
  const response = await serverGet<DonationReportItem[]>(
    `/analytics/donation-report?startDate=${startDate}&endDate=${endDate}`,
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};
