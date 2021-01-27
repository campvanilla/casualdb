import get from "https://deno.land/x/lodash@4.17.15-es/get.js";
import set from "https://deno.land/x/lodash@4.17.15-es/set.js";

import { Connector, ConnectOptions } from "./connector.ts";
import { createNewOperator } from "./operator/utils.ts";

class CasualDB<Schema> {
  private _connector: Connector<Schema>;

  constructor() {
    this._connector = new Connector();
  }

  async connect(fsPath: string, options?: ConnectOptions) {
    return this._connector.connect(fsPath, options);
  }

  async get<T>(path: string) {
    const data = await this._connector.read();
    const value: T = get(data, path, null);

    return createNewOperator<T>(value);
  }

  async seed(data: Schema) {
    return this._connector.write(data);
  }

  async write<T>(path: string, value: T) {
    const data = await this._connector.read();
    const updatedData = set(data, path, value);
    return this._connector.write(updatedData);
  }
}

export default CasualDB;
export { CasualDB };
export { PrimitiveOperator, CollectionOperator } from "./operator/operators.ts";
