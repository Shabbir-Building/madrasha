import { API_URL } from '@/config/api';
import { type BetterFetchOption, createFetch } from '@better-fetch/fetch';

import type { ApiResponse, FetchOptions } from './types';

const betterFetch = createFetch({
  baseURL: API_URL,
  retry: 3,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

type Error = {
  status: number;
  statusText: string;
};

const publicGet = async <T, E = unknown>(endpoint: string, fetchOptions?: FetchOptions) => {
  console.log('publicGet', endpoint);
  const { throw: shouldThrow, query, params, accessToken, ...restOptions } = fetchOptions || {};

  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  const { data, error } = await betterFetch<ApiResponse<T>, Error & E>(url, {
    query,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    ...restOptions,
  } as BetterFetchOption);
  if (shouldThrow && error) throw error;

  return { data: data?.data, error };
};

const publicPost = async <T, E = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
  fetchOptions?: FetchOptions,
) => {
  const { throw: shouldThrow, query, params, accessToken, ...restOptions } = fetchOptions || {};

  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  const { data, error } = await betterFetch<ApiResponse<T>, Error & E>(url, {
    method: 'POST',
    body,
    query,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    ...restOptions,
  } as BetterFetchOption);
  if (shouldThrow && error) throw error;
  return { data: data?.data, error };
};

const publicPatch = async <T, E = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
  fetchOptions?: FetchOptions,
) => {
  const { throw: shouldThrow, query, params, accessToken, ...restOptions } = fetchOptions || {};

  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  const { data, error } = await betterFetch<ApiResponse<T>, Error & E>(url, {
    method: 'PATCH',
    body,
    query,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    ...restOptions,
  } as BetterFetchOption);
  if (shouldThrow && error) throw error;
  return { data: data?.data, error };
};

const publicPut = async <T, E = unknown>(
  endpoint: string,
  body: Record<string, unknown>,
  fetchOptions?: FetchOptions,
) => {
  const { throw: shouldThrow, query, params, accessToken, ...restOptions } = fetchOptions || {};

  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  const { data, error } = await betterFetch<ApiResponse<T>, Error & E>(url, {
    method: 'PUT',
    body,
    query,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    ...restOptions,
  } as BetterFetchOption);
  if (shouldThrow && error) throw error;
  return { data: data?.data, error };
};

const publicDelete = async <T, E = unknown>(endpoint: string, fetchOptions?: FetchOptions) => {
  const { throw: shouldThrow, query, params, accessToken, ...restOptions } = fetchOptions || {};

  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }

  const { data, error } = await betterFetch<ApiResponse<T>, Error & E>(url, {
    method: 'DELETE',
    query,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    ...restOptions,
  } as BetterFetchOption);
  if (shouldThrow && error) throw error;
  return { data: data?.data, error };
};

export { publicGet, publicPost, publicPatch, publicPut, publicDelete };
