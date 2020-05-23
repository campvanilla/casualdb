import { Predicate, PredicateFunction } from "./types.ts";
import matches from "https://deno.land/x/lodash/matches.js";

class Operator<Op> {
  private data: Op;

  constructor(data: Op) {
    this.data = data;
  }

  value() {
    return this.data;
  }

  size(): number | null {
    if (!Array.isArray(this.data)) {
      return null;
    }

    return this.data.length;
  }

  update<T = Op>(
    updateMethod: (currentValue: Op) => T,
  ): Operator<ReturnType<typeof updateMethod>> {
    return new Operator<ReturnType<typeof updateMethod>>(updateMethod(this.data));
  }

  find(predicate: Predicate<Op>) {
    if (Array.isArray(this.data)) {
      if (typeof predicate === 'function') {
        return new Operator(this.data.find(predicate));
      } else {
        return new Operator(
          matches(this.data)(predicate)[0] || null
        );
      }
    }
    
    throw new Error("[CasualDB] Not an array.");
  }

  push(data: Op extends (infer U)[] ? U : Op) {
    if (Array.isArray(this.data)) {
      return new Operator([...this.data, data]);
    }

    throw new Error('[CasualDB] Not an array.');
  }

  findAll(predicate: Predicate<Op extends (infer U)[] ? U : Op>): Operator<Array<Op extends (infer U)[] ? U : Op>> {
    if (Array.isArray(this.data)) {
      if (typeof predicate === 'function') {
        return new Operator(this.data.filter(predicate));
      } else {
        return new Operator(
          matches(this.data)(predicate) || null
        );
      }
    }

    throw new Error("[CasualDB] Not an array.");
  }

  findAndUpdate<T = Op extends (infer U)[] ? U : Op, K = Op extends (infer U)[] ? U : Op>(
    predicate: Predicate<Partial<T>>,
    updateMethod: (value: K) => K
  ): Operator<K[]> {
    const predicateFunction = typeof predicate === 'function' ? predicate : matches(predicate);
    
    if (Array.isArray(this.data)) {
      return new Operator(this.data.map((value: K) => {
        if (predicateFunction(value)) {
          return updateMethod(value);
        }

        return value;
      }));
    }

    throw new Error("[CasualDB] Not an array.");
  }
}

export default Operator;