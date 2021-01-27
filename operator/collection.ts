import matches from "https://deno.land/x/lodash@4.17.15-es/matches.js";

import { BaseOperator } from "./base.ts";
import { SortArg, Predicate } from "./types.ts";
import { compareFunction, createNewOperator } from "./utils.ts";

export class CollectionOperator<Op> extends BaseOperator<Op[]> {
  constructor(data: Op[]) {
    super(data);

    if (!Array.isArray(data)) {
      throw new Error(
        "[casualdb] CollectionOperator initialized with a value that is not an array.",
      );
    }
  }

  /**
   * Get the size (length) of the collection.
   */
  size(): number {
    return this.data.length;
  }

  push(data: Op) {
    return new CollectionOperator([...this.data, data]);
  }

  /**
   * Find & return one element from the collection
   */
  findOne(
    /** the predicate must be either:
     * - a function which returns true when the desired item from the collection is "found".
     * - Pass an object which will be deep-compared with each item in the collection until a match is "found";
     *   using `_.matches` from lodash as the function.
     */
    predicate: Predicate<Op>,
  ) {
    const predicateFunction = typeof predicate === "function"
      ? predicate
      : matches(predicate);

    const found = this.data.find((i) => predicateFunction(i));
    return createNewOperator(found || null);
  }

  findAll(predicate: Predicate<Op>): CollectionOperator<Op> {
    const predicateFunction = typeof predicate === "function"
      ? predicate
      : matches(predicate);
    const filtered = this.data.filter(predicateFunction);
    return new CollectionOperator(filtered);
  }

  findAllAndUpdate<T = Op>(
    predicate: Predicate<Partial<T>>,
    updateMethod: (value: Op) => Op,
  ): CollectionOperator<Op> {
    const predicateFunction = typeof predicate === "function"
      ? predicate
      : matches(predicate);

    return new CollectionOperator(this.data.map((value: Op) => {
      if (predicateFunction(value)) {
        return updateMethod(value);
      }

      return value;
    }));
  }

  findAllAndRemove<T = Op>(
    predicate: Predicate<Partial<T>>,
  ): CollectionOperator<Op> {
    const predicateFunction = typeof predicate === "function"
      ? predicate
      : matches(predicate);
    return new CollectionOperator(
      this.data.filter((value: Op) => !predicateFunction(value)),
    );
  }

  findById(id: string | number) {
    return this.findOne({ id } as unknown as Op);
  }

  findByIdAndRemove(id: string | number) {
    return this.findAllAndRemove<{ id?: string | number }>({ id });
  }

  findByIdAndUpdate(id: string | number, updateMethod: (value: Op) => Op) {
    return this.findAllAndUpdate<{ id?: string | number }>(
      { id },
      updateMethod,
    );
  }

  sort(compare: SortArg<Op>) {
    if (typeof compare === "function") {
      const sorted = [...this.data].sort(compare);
      return new CollectionOperator(sorted);
    }
    const sorted = [...this.data].sort(compareFunction(compare));
    return new CollectionOperator(sorted);
  }

  page(page: number, pageSize: number): CollectionOperator<Op> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return new CollectionOperator(this.data.slice(start, end));
  }

  pick<U extends keyof Op>(keys: Array<U>) {
    return new CollectionOperator(this.data.map((value) => {
      const obj = {} as { [P in U]: Op[P] };

      keys.forEach((key) => {
        if (value[key]) {
          obj[key] = value[key];
        }
      });

      return obj;
    }));
  }
}
