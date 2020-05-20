import get from "https://deno.land/x/lodash/get.js";
import set from "https://deno.land/x/lodash/set.js";
import { readJson } from "https://deno.land/std/fs/read_json.ts";
import { writeJson } from "https://deno.land/std/fs/write_json.ts";

interface ConnectOptions {
  bailIfNotPresent?: boolean;
}

class CasualDB<Schema> {
  private filePath: string;

  constructor() {
    this.filePath = "";
  }

  private checkConnection() {
    if (!this.filePath) {
      throw new Error("DB connection not set. Cannot read.");
    }
  }

  private async read(): Promise<Schema> {
    this.checkConnection();
    const data = await readJson(this.filePath);

    return data as Schema;
  }

  async connect(fsPath: string, options?: ConnectOptions): Promise<void> {
    try {
      const fileInfo = await Deno.stat(fsPath);

      if (!fileInfo.isFile) {
        throw new Error("Not a file");
      }

      this.filePath = fsPath;
      this.read();
    } catch (err) {
      if (
        err instanceof Error && err.toString().startsWith("NotFound") &&
        !options?.bailIfNotPresent
      ) {
        await writeJson(fsPath, {});
        this.filePath = fsPath;
        return;
      }
      throw err;
    }
  }

  async get<T>(path: string): Promise<T> {
    this.checkConnection();

    const data = await this.read();
    const value = get(data, path, null);
    return value as T;
  }

  async seed(data: Schema) {
    this.checkConnection();

    const worker = new Worker(
      "./writeWorker.ts",
      { type: "module", deno: true },
    );
    worker.postMessage({
      file: this.filePath,
      data,
    });
  }

  async write<T>(path: string, value: T) {
    this.checkConnection();
    const data = await this.read();
    const worker = new Worker(
      "./writeWorker.ts",
      { type: "module", deno: true },
    );
    worker.postMessage({
      file: this.filePath,
      data: set(data, path, value),
    });
  }

  async update<T>(
    path: string,
    updateMethod: (currentValue: T) => T,
  ) {
    this.checkConnection();

    const data = await this.get<T>(path);
    return this.write<T>(path, updateMethod(data));
  }

  async count(path: string): Promise<number | null> {
    this.checkConnection();

    const data = await this.get(path);

    if (!Array.isArray(data)) {
      return null;
    }

    return data.length;
  }

  async findById<T>(path: string, id: string): Promise<T | null> {
    this.checkConnection();

    const data = await this.get(path);

    if (!Array.isArray(data)) {
      return null;
    }

    for (let i = 0; i < data.length; i++) {
      if (data[i].id == id) {
        return data[i] as T;
      }
    }

    return null;
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
console.log("get", await test.get("posts[1]"));
console.log("write", await test.write("user.name", "Camp Vanilla 123"));
console.log("get", await test.get("user.name"));
console.log(
  "update",
  await test.update<number>("user.age", (value) => {
    console.log("Previous value", value);
    return value + 1;
  }),
);
console.log("get", await test.get("user.age"));
console.log("count", await test.count("posts"));
console.log("findById", await test.findById("posts", "2"));
console.log("findById", await test.findById("users", "2"));
