export type Merge<T, R> = Omit<T, keyof R> & R;

export type Optional<T, K extends keyof T> = Merge<T, Partial<Pick<T, K>>>;

export type OptionalExcept<T, K extends keyof T> = Merge<Partial<T>, Pick<T, K>>;

export type Override<T, K> = Omit<T, keyof K> & K;
