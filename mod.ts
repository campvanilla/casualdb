import get from 'https://deno.land/x/lodash/get.js';
import set from 'https://deno.land/x/lodash/set.js';
import { readJson } from 'https://deno.land/std/fs/read_json.ts';
import { writeJson } from 'https://deno.land/std/fs/write_json.ts';

class CasualDB<Schema> {
  private filePath: string;

  constructor() {
    this.filePath = '';
  }

  private async read(): Promise<Schema> {
    if (!this.filePath) {
      throw new Error('DB connection not set. Cannot read.');
    }

    return readJson(this.filePath) as Promise<Schema>
  }

  async connect(fsPath: string, bailIfNotPresent?: boolean): Promise<void> {
    try {
      const fileInfo = await Deno.stat(fsPath);
      if (!fileInfo.isFile) throw new Error('Not a file');
      this.filePath = fsPath;
    } catch (err) {
      if (err instanceof Error && err.toString().startsWith('NotFound') && !bailIfNotPresent) {
        await writeJson(fsPath, {});
        this.filePath = fsPath;
        return;
      }
      throw err;
    }
  }

  async get<T>(path: string) {
    try {
      const data = await this.read();
      const value = get(data, path, null);
      return value;
    } catch(err) {
      throw err;
    }
  }

  async seed(data: Schema) {
    if (this.filePath) {
      return writeJson(this.filePath, data);
    }
  }

  async write<T>(path: string, value: T) {
    if (this.filePath) {
      const data = await this.read();
      return writeJson(this.filePath, set(data, path, value));
    }
  }

  async update<T>(
    path: string,
    updateMethod: (currentValue: T) => T
  ) {
    if (this.filePath) {
      const data = await this.get<T>(path);
      return this.write<T>(path, updateMethod(data));
    }
  }
}

interface Schema {
  posts: Array<{
    title: string;
  }>;
  user: {
    name: string;
    age: number;
  }
}

const test = new CasualDB<Schema>();
await test.connect('./test-db.json');
await test.seed({
  posts: [{
    title: 'Post 1',
  }, {
    title: 'Post 2',
  }],
  user: {
    name: 'Camp Vanilla',
    age: 5,
  },
});
console.log('get', await test.get('posts[1]'));
console.log("write", await test.write('user.name', 'Camp Vanilla 123'));
console.log('get', await test.get('user.name'));
console.log("update", await test.update<number>("user.age", (value) => {
  console.log("Previous value", value);
  return value + 1;
}));
console.log("get", await test.get("user.age"));