import { Predicate, PredicateFunction } from "./types.ts";
import matches from "https://deno.land/x/lodash/matches.js";


class BaseOperator<Op> {
  protected data: Op;

  constructor(data: Op) {
    this.data = data;
  }

  value() {
    return this.data;
  }
}

class PrimitiveOperator<Op> extends BaseOperator<Op> {
  constructor(data: Op) {
    super(data);

    if (Array.isArray(data)) {
      throw new Error('[CasualDb] PrimitiveOperator; initialized with a value that is an array.');
    }
  }

  update<T = Op>(
    updateMethod: (currentValue: Op) => T,
  ): PrimitiveOperator<ReturnType<typeof updateMethod>> {
    return new PrimitiveOperator<ReturnType<typeof updateMethod>>(updateMethod(this.data));
  }
}

class CollectionOperator<Op> extends BaseOperator<Op[]> {
  constructor(data: Op[]) {
    super(data);

    if (!Array.isArray(data)) {
      throw new Error('[CasualDb] CollectionOperator initialized with a value that is not an array.');
    }
  }

  size(): number | null {
    if (!Array.isArray(this.data)) {
      return null;
    }

    return this.data.length;
  }

  findOne<T = Op>(predicate: Predicate<Partial<T>>): PrimitiveOperator<Op | null> {
    const predicateFunction = typeof predicate === 'function' ? predicate : matches(predicate);

    const found = this.data.find(i => predicateFunction(i));
    return new PrimitiveOperator(found || null);
  }

  push(data: Op) {
    return new CollectionOperator([...this.data, data]);
  }

  findAll(predicate: Predicate<Op>): CollectionOperator<Op> {
    const predicateFunction = typeof predicate === 'function' ? predicate : matches(predicate);

    return new CollectionOperator(this.data.filter(predicateFunction));
  }

  findAllAndUpdate<T = Op>(
    predicate: Predicate<Partial<T>>,
    updateMethod: (value: Op) => Op
  ): CollectionOperator<Op> {
    const predicateFunction = typeof predicate === 'function' ? predicate : matches(predicate);
    
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
    const predicateFunction = typeof predicate === 'function' ? predicate : matches(predicate);
    return new CollectionOperator(this.data.filter((value: Op) => !predicateFunction(value)));
  }

  findById(id: string | number) {
    return this.findOne<{ id?: string | number }>({ id });
  }

  findByIdAndRemove(id: string | number) {
    return this.findAllAndRemove<{ id?: string | number }>({ id });
  }

  findByIdAndUpdate(id: string | number, updateMethod: (value: Op) => Op) {
    return this.findAllAndUpdate<{ id?: string | number }>({ id }, updateMethod);
  }
}

export {
  PrimitiveOperator,
  CollectionOperator
};