export interface PredicateFunction<T> {
  (value: T): boolean;
}

export type Predicate<T> = Partial<T> | PredicateFunction<T>;

export type ID = string | number;

export type SortKeys<M> = (keyof M)[];

export interface SortMethod<M> {
  (a: M, b: M): number;
}

export type SortArg<M> = SortKeys<M> | SortMethod<M>;
