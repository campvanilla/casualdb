export class BaseOperator<Op> {
  protected data: Op;

  constructor(data: Op) {
    this.data = data;
  }

  value() {
    return this.data;
  }
}
