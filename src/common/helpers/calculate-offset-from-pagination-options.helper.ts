import { PaginationOptions } from '../types';

export const calculateOffsetFromPaginationOptions = ({ page, limit }: PaginationOptions): number => (
  (page - 1) * limit
);
