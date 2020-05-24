import { BaseOperator } from './base.ts';

export class PrimitiveOperator<Op> extends BaseOperator<Op> {
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
