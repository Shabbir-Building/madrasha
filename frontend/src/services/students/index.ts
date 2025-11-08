import {
  type CacheConfig,
  type FetchOptions,
  type PaginationResult,
  publicPost,
  publicPut,
  serverGet,
} from '@/services/api';

import type { CreateStudentInput, Student, StudentDetails, UpdateStudentInput } from './types';

const getStudents = async (fetchOptions?: FetchOptions, cacheConfig?: CacheConfig) => {
  const response = await serverGet<PaginationResult<Student>>(
    '/students',
    fetchOptions,
    cacheConfig,
  );
  const data = response.data;
  if (!data) return data;

  return {
    ...data,
    docs: data.docs.filter((student) => !student.disable),
  };
};

const getStudentById = async (id: string, fetchOptions?: FetchOptions) => {
  const response = await serverGet<StudentDetails>('/students/:id', {
    ...fetchOptions,
    params: { id },
  });
  return response.data;
};

const createStudent = async (body: CreateStudentInput, fetchOptions?: FetchOptions) => {
  const response = await publicPost<unknown>('/students/create-student', body, fetchOptions);
  return response;
};

const updateStudent = async (id: string, body: UpdateStudentInput, fetchOptions?: FetchOptions) => {
  const response = await publicPut<unknown>('/students/:id', body, {
    ...fetchOptions,
    params: { id },
  });
  return response;
};

export { getStudents, getStudentById, createStudent, updateStudent };
