export type UUIDv4 = `${string}-${string}-${string}-${string}-${string}`;
export type JWT = `${string}.${string}.${string}`;
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type RemovePropertiesWith<T extends Record<string, unknown>, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}
export type RemovePropertiesWithNever<T extends Record<string, unknown>> = RemovePropertiesWith<T, never>;

export type UserTokenPayload = {
  id: UUIDv4;
};
