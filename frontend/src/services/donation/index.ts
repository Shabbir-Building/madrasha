import {
  type CacheConfig,
  type FetchOptions,
  type PaginationResult,
  publicDelete,
  publicPost,
  publicPut,
  serverGet,
} from '@/services/api';

import type { CreateDonationInput, Donation, UpdateDonationInput } from './types';

const getDonations = async (fetchOptions?: FetchOptions, cacheConfig?: CacheConfig) => {
  const response = await serverGet<PaginationResult<Donation>>(
    '/donations',
    fetchOptions,
    cacheConfig,
  );
  return response.data;
};

const createDonation = async (body: CreateDonationInput, fetchOptions?: FetchOptions) => {
  const response = await publicPost<unknown>('/donations/create-donation', body, fetchOptions);
  return response;
};

const updateDonation = async (
  id: string,
  body: UpdateDonationInput,
  fetchOptions?: FetchOptions,
) => {
  const response = await publicPut<unknown>('/donations/:id', body, {
    ...fetchOptions,
    params: { id },
  });
  return response;
};

const deleteDonation = async (id: string, fetchOptions?: FetchOptions) => {
  const response = await publicDelete<unknown>('/donations/:id', {
    ...fetchOptions,
    params: { id },
  });
  return response;
};

export { getDonations, createDonation, updateDonation, deleteDonation };
