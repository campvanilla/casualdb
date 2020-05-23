import { Predicate } from "./types.ts";
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

  update(
    updateMethod: (currentValue: Op) => any,
  ) {
    return new Operator<ReturnType<typeof updateMethod>>(updateMethod(this.data));
  }

  find(predicate: Predicate<Op>) {
    if (Array.isArray(this.data)) {
      if (typeof predicate === 'function') {
        return new Operator(this.data.find(predicate));
      } else {
        return new Operator(
          matches(this.data, predicate)[0] || null
        );
      }
    }
    return new Operator(null);
  }

  push(data: Op extends (infer U)[] ? U : Op) {
    if (Array.isArray(this.data)) {
      return new Operator([...this.data, data]);
    }

    throw new Error('[CasualDB] Not an array.');
  }
}

export default Operator;