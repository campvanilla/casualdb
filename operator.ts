import { Predicate, ID, Poopy } from "./types.ts";
import matches from "https://deno.land/x/lodash/matches.js";

class Operator<Schema> {
  private data: Schema;

  constructor(data: Schema) {
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

  update<T>(
    updateMethod: (currentValue: Schema) => T,
  ) {
    return new Operator<T>(updateMethod(this.data));
  }

  find(predicate: Predicate<Schema>) {
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
}

export default Operator;