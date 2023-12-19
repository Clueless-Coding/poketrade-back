export type UUIDv4 = `${string}-${string}-${string}-${string}-${string}`;
export type JWT = `${string}.${string}.${string}`;
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;

export type UserTokenPayload = {
  id: UUIDv4;
};
