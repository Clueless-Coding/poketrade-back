export type UUIDv4 = `${string}-${string}-4${string}-${string}-${string}`;
export type JWT = `${string}.${string}.${string}`;
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type ValueOf<T> = T[keyof T];

export type PaginatedArray<T> = {
  items: Array<T>,
  meta: {
    itemCount: number,
    itemsPerPage: number,
    currentPage: number,
    totalItems: number,
    totalPages: number,
  }
};

export type PaginationOptions = {
  page: number,
  limit: number,
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
type UnionToOvlds<U> = UnionToIntersection<
  U extends any ? (f: U) => void : never
>;
type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

export type UnionToArray<T, A extends unknown[] = []> = IsUnion<T> extends true
  ? UnionToArray<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
  : [T, ...A];
