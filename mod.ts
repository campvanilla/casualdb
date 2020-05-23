import get from "https://deno.land/x/lodash/get.js";
import set from "https://deno.land/x/lodash/set.js";

import Connector from './connector.ts';
import Operator from './operator.ts';
import { ConnectOptions } from './types.ts';

class CasualDB<Schema, Current = any> {
  private connector: Connector<Schema>;

  constructor() {
    this.connector = new Connector();
  }

  async connect(fsPath: string, options?: ConnectOptions) {
    return this.connector.connect(fsPath, options);
  }

  async get<T>(path: string): Promise<Operator<T>> {
    const data = await this.connector.read();
    const value = get(data, path, null);
    return new Operator(value) as Operator<T>;
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

interface Schema {
  posts: Array<{
    id: number;
    title: string;
  }>;
  user: {
    name: string;
    age: number;
  };
}

const test = new CasualDB<Schema>();
await test.connect("./test-db.json");

await test.seed({
  posts: [{
    id: 1,
    title: "Post 1",
  }, {
    id: 2,
    title: "Post 2",
  }],
  user: {
    name: "Camp Vanilla",
    age: 5,
  },
});

const data = await test.get<Schema["posts"]>("posts");
const updateData = data.findAndUpdate({ id: 1 }, (value) => {
  return {
    ...value,
    title: 'modified post',
  }
});

console.log(updateData.value());
// await test.write(
//   "posts",
//   data
//     .findAll((value: any) => {
//       return value.title === 'Post 1';
//     })
//     .update((value: any) => ({ ...value, id: 4 }))
//     .value(),
// );
// console.log(data.value());
// const updatedData = data.update(() => {
//   return {
//     id: "3",
//     title: "modified",
//   };
// }).value();

// console.log(updatedData);

// await test.write("posts[1]", updatedData);

// const updatedData = await test.get("posts[1]");
// console.log(updatedData.value());

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
