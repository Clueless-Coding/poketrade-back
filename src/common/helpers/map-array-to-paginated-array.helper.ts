import { PaginatedArray } from "../types";

export const mapArrayToPaginatedArray = <T>(
  items: Array<T>,
  options: { page: number, limit: number },
): PaginatedArray<T> => ({
  items,
  meta: {
    itemCount: items.length,
    itemsPerPage: options.limit,
    currentPage: options.page,
  },
})
