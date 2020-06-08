import { dirname, join } from "https://deno.land/std@0.54.0/path/mod.ts"
import { readJson } from "https://deno.land/std/fs/read_json.ts";
import { writeJson } from "https://deno.land/std/fs/write_json.ts";

export interface ConnectOptions {
  bailIfNotPresent?: boolean;
}

const getNow = Date.now;

export class Connector<Schema = any> {
  private _filePath: string = "";
  private readonly WRITE_TIMEOUT: number = 10000;
  private readonly WRITE_WORKER_PATH: string = join(dirname(import.meta.url), "writeWorker.ts");
  private readonly WRITE_WORKER_OPTIONS: { type: "module"; deno: boolean } = {
    type: "module",
    deno: true,
  };

  private _checkConnection() {
    if (!this._filePath) {
      throw new Error("DB connection not set. Cannot read.");
    }
  }

  private _createTaskId(): string {
    return `casualdb:connector:${getNow()}`;
  }

  async read() {
    this._checkConnection();
    return readJson(this._filePath) as Promise<Schema>;
  }

  async connect(fsPath: string, options?: ConnectOptions): Promise<void> {
    try {
      const fileInfo = await Deno.stat(fsPath);

      if (!fileInfo.isFile) {
        throw new Error("Not a file");
      }

      this._filePath = fsPath;
      this.read();
    } catch (err) {
      if (
        err instanceof Error && err.toString().startsWith("NotFound") &&
        !options?.bailIfNotPresent
      ) {
        await writeJson(fsPath, {});
        this._filePath = fsPath;
        return;
      }
      throw err;
    }
  }

  write(data: Schema) {
    return new Promise((resolve, reject) => {
      this._checkConnection();
      const taskId = this._createTaskId();
      let timeout: null | number = null;

      const worker = new Worker(
        this.WRITE_WORKER_PATH,
        { ...this.WRITE_WORKER_OPTIONS },
      );

      worker.onmessage = (e) => {
        const { taskId: returnedTaskId, error } = e.data;

        if (
          returnedTaskId && returnedTaskId.toString() === taskId &&
          error === false
        ) {
          resolve();
        } else if (error) {
          reject(error);
        } else {
          console.debug(
            "[casualdb:connector:debug]",
            { returnedTaskId, taskId, error },
          );
          reject(new Error(`[casualdb] unknown error while writing to file`));
        }
        if (timeout) {
          clearTimeout(timeout);
        }
      };

      timeout = setTimeout(() => {
        reject(
          new Error(
            `[casualdb] timed out while waiting for worker to respond while writing.`,
          ),
        );
      }, this.WRITE_TIMEOUT);

      worker.postMessage({
        file: this._filePath,
        taskId,
        data,
      });
    });
  }
}
