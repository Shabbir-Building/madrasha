import {
  type CacheConfig,
  type FetchOptions,
  type PaginationResult,
  publicDelete,
  publicPost,
  publicPut,
  serverGet,
} from '@/services/api';

import type { CreateExpenseInput, Expense, UpdateExpenseInput } from './types';

const getExpenses = async (fetchOptions?: FetchOptions, cacheConfig?: CacheConfig) => {
  const response = await serverGet<PaginationResult<Expense>>(
    '/expenses',
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

const createExpense = async (body: CreateExpenseInput, fetchOptions?: FetchOptions) => {
  const response = await publicPost<unknown>('/expenses/create-expense', body, fetchOptions);
  return response;
};

const updateExpense = async (
  id: string,
  body: UpdateExpenseInput,
  fetchOptions?: FetchOptions,
) => {
  const response = await publicPut<unknown>('/expenses/:id', body, {
    ...fetchOptions,
    params: { id },
  });
  return response;
};

const deleteExpense = async (id: string, fetchOptions?: FetchOptions) => {
  const response = await publicDelete<unknown>('/expenses/:id', {
    ...fetchOptions,
    params: { id },
  });
  return response;
};

export { getExpenses, createExpense, updateExpense, deleteExpense };
