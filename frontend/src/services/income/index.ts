import {
  type CacheConfig,
  type FetchOptions,
  type PaginationResult,
  publicDelete,
  publicPost,
  publicPut,
  serverGet,
} from '@/services/api';

import type { CreateIncomeInput, Income, UpdateIncomeInput } from './types';

const getIncomes = async (fetchOptions?: FetchOptions, cacheConfig?: CacheConfig) => {
  const response = await serverGet<PaginationResult<Income>>('/incomes', fetchOptions, cacheConfig);
  return response.data;
};

const getIncomeById = async (id: string, fetchOptions?: FetchOptions) => {
  const response = await serverGet<Income>('/incomes/:id', {
    ...fetchOptions,
    params: { id },
  });
  return response.data;
};

const createIncome = async (body: CreateIncomeInput, fetchOptions?: FetchOptions) => {
  const response = await publicPost<unknown>('/incomes/create-income', body, fetchOptions);
  return response;
};

const updateIncome = async (id: string, body: UpdateIncomeInput, fetchOptions?: FetchOptions) => {
  const response = await publicPut<unknown>('/incomes/:id', body, {
    ...fetchOptions,
    params: { id },
  });
  return response;
};

const deleteIncome = async (id: string, fetchOptions?: FetchOptions) => {
  const response = await publicDelete<unknown>('/incomes/:id', {
    ...fetchOptions,
    params: { id },
  });
  return response;
};

export { getIncomes, getIncomeById, createIncome, updateIncome, deleteIncome };
