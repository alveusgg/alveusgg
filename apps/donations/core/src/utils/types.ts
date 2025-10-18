export type WithPrimaryProperty<T> = {
  [K in keyof T]-?: {
    primary: K;
  } & Required<Pick<T, K>> &
    Partial<Omit<T, K>>;
}[keyof T];
