type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

// https://privacycg.github.io/gpc-spec/#javascript-property-to-detect-preference
declare interface Navigator {
  globalPrivacyControl?: boolean;
}
