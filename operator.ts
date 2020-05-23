import { Predicate, PredicateFunction } from "./types.ts";
import matches from "https://deno.land/x/lodash/matches.js";

class PrimitiveOperator<Op> {
  protected data: Op;

  constructor(data: Op) {
    this.data = data;
  }

  value() {
    return this.data;
  }

  update<T = Op>(
    updateMethod: (currentValue: Op) => T,
  ): PrimitiveOperator<ReturnType<typeof updateMethod>> {
    return new PrimitiveOperator<ReturnType<typeof updateMethod>>(updateMethod(this.data));
  }
}

class CollectionOperator<Op> extends PrimitiveOperator<Op[]> {
  constructor(data: Op[]) {
    super(data);
  }

  size(): number | null {
    if (!Array.isArray(this.data)) {
      return null;
    }

    return this.data.length;
  }

  find(predicate: Predicate<Op>) {
    if (typeof predicate === 'function') {
      return new PrimitiveOperator(this.data.find(predicate));
    } else {
      return new PrimitiveOperator(
        matches(this.data)(predicate)[0] || null
      );
    }
  }

  push(data: Op) {
    return new CollectionOperator([...this.data, data]);
  }

  findAll(predicate: Predicate<Op>): PrimitiveOperator<Array<Op>> {
    if (typeof predicate === 'function') {
      return new CollectionOperator(this.data.filter(predicate));
    } else {
      return new CollectionOperator(
        matches(this.data)(predicate) || null
      );
    }
  }

  findAndUpdate(
    predicate: Predicate<Partial<Op>>,
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

  findAndRemove(
    predicate: Predicate<Partial<Op>>,
  ): CollectionOperator<Op> {
    const predicateFunction = typeof predicate === 'function' ? predicate : matches(predicate);
    return new CollectionOperator(this.data.filter((value: Op) => !predicateFunction(value)));
  }
}

export {
  PrimitiveOperator,
  CollectionOperator
};