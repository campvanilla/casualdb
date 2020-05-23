export interface ConnectOptions {
  bailIfNotPresent?: boolean;
}

export interface PredicateFunction<T> {
  (value: T): boolean;
}

export type Predicate<T> = Partial<T> | PredicateFunction<T>;

export type ID = string | number;
