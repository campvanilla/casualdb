import { BaseOperator } from "./base.ts";
import pick from "https://deno.land/x/lodash@4.17.15-es/pick.js";

export class PrimitiveOperator<Op> extends BaseOperator<Op> {
  constructor(data: Op) {
    super(data);

    if (Array.isArray(data)) {
      throw new Error(
        "[casualdb] PrimitiveOperator; initialized with a value that is an array.",
      );
    }
  }

  update<T = Op>(
    updateMethod: (currentValue: Op) => T,
  ): PrimitiveOperator<ReturnType<typeof updateMethod>> {
    return new PrimitiveOperator<ReturnType<typeof updateMethod>>(
      updateMethod(this.data),
    );
  }

  pick<U extends keyof Op>(paths: Array<U>) {
    const picked = pick(this.data, ...paths) as { [P in U]: Op[P] };
    return new PrimitiveOperator<{ [P in U]: Op[P] }>(picked);
  }
}
