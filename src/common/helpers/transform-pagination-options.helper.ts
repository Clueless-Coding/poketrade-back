import { PaginationOptions } from '../types';

export const transformPaginationOptions = (paginationOptions: PaginationOptions): PaginationOptions => ({
  page: Math.max(1, paginationOptions.page),
  limit: Math.max(0, paginationOptions.limit),
});
