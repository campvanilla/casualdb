import get from "https://deno.land/x/lodash/get.js";

import Connector from './connector.ts';
import Operator from './operator.ts';
import { ConnectOptions } from './types.ts';

class CasualDB<Schema, Current = any> {
  private connector: Connector<Schema>;

  constructor(fsPath: string, options?: ConnectOptions) {
    this.connector = new Connector();
    this.connector.connect(fsPath, options);
  }

  async get<T>(path: string): Promise<Operator<T>> {
    const data = await this.connector.read();
    const value = get(data, path, null);
    return new Operator(value) as Operator<T>;
  }

  async seed(data: Schema) {
    this.connector.write('', data);
  }

  async write<T>(path: string, value: T) {
    this.connector.write(path, value);
  }
}

// interface Schema {
//   posts: Array<{
//     id: number;
//     title: string;
//   }>;
//   user: {
//     name: string;
//     age: number;
//   };
// }

// const test = new CasualDB<Schema>("./test-db.json");
// await test.seed({
//   posts: [{
//     id: 1,
//     title: "Post 1",
//   }, {
//     id: 2,
//     title: "Post 2",
//   }],
//   user: {
//     name: "Camp Vanilla",
//     age: 5,
//   },
// });
// console.log("get", await test.get("posts[1]"));
// console.log("write", await test.write("user.name", "Camp Vanilla 123"));
// console.log("get", await test.get("user.name"));
// console.log(
//   "update",
//   await test.update<number>("user.age", (value) => {
//     console.log("Previous value", value);
//     return value + 1;
//   }),
// );
// console.log("get", await test.get("user.age"));
// console.log("count", await test.size("posts"));
// console.log("findById", await test.findById("posts", "2"));
// console.log("findById", await test.findById("users", "2"));
