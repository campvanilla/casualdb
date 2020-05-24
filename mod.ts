import get from "https://deno.land/x/lodash/get.js";
import set from "https://deno.land/x/lodash/set.js";

import Connector from './connector.ts';
import { CollectionOperator, PrimitiveOperator } from './operator/operators.ts';
import { ConnectOptions } from './types.ts';

class CasualDB<Schema> {
  private connector: Connector<Schema>;

  constructor() {
    this.connector = new Connector();
  }

  async connect(fsPath: string, options?: ConnectOptions) {
    return this.connector.connect(fsPath, options);
  }

  async get<T>(path: string): Promise<T extends (infer U)[] ? CollectionOperator<U> : PrimitiveOperator<T>> {
    const data = await this.connector.read();
    const value: T = get(data, path, null);

    if (Array.isArray(value)) {
      return new CollectionOperator(value) as any;
    }

    return new PrimitiveOperator(value) as any;
  }

  async seed(data: Schema) {
    return this.connector.write(data);
  }

  async write<T>(path: string, value: T) {
    const data = await this.connector.read();
    const updatedData = set(data, path, value);
    return this.connector.write(updatedData);
  }
}

export default CasualDB;
export { CasualDB };
export { PrimitiveOperator, CollectionOperator } from './operator/operators.ts';
