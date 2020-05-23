import { ID, Predicate } from './types.ts';
import matches from "https://deno.land/x/lodash/matches.js";

interface CasualInstance {
  id?: ID;
  [key: string]: any;
}

type Operand = CasualInstance | Array<CasualInstance> | null;

abstract class BaseOperator<Op extends Operand> {
  protected data: Op;

  constructor(data: Op) {
    this.data = data;
  }

  value() {
    return this.data;
  }
}

export class Value<Op> extends BaseOperator<Op> {
  update() {

  }
}

export class CollectionOperator<Op> extends BaseOperator<Op[]>{
  constructor(data: Op[]) {
    super(data);
  }

  size(): number {
    return this.data.length;
  }

  find(predicate: Predicate<Op>) {
    const predicateFunction = typeof predicate === 'function' ? predicate : matches(predicate);
    const found = this.data.find(i => predicateFunction(i));
    return typeof found === 'undefined' ? new Value(null) : new Value(found);
  }

  findById(id: ID) {
    return this.find(matches({ id }));
  }

  update<T>(
    updateMethod: (item: Op) => T
  ) {
    const updated = this.data.map<T>(item => updateMethod(item));
    return new CollectionOperator(updated);
  }
}
