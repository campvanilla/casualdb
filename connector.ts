import { readJson } from "https://deno.land/std/fs/read_json.ts";
import { writeJson } from "https://deno.land/std/fs/write_json.ts";

import { ConnectOptions } from './types.ts';

class Connector<Schema> {
  private filePath: string;

  constructor() {
    this.filePath = "";
  }

  private checkConnection() {
    if (!this.filePath) {
      throw new Error("DB connection not set. Cannot read.");
    }
  }

  async read(): Promise<Schema> {
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

  async write(data: Schema) {
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
}

export default Connector;