import { writeJson } from "https://deno.land/std/fs/write_json.ts";

self.onmessage = async (e) => {
  console.log("[Debug] Worker Thread");
  const { file, data, taskId } = e.data;

  try {
    await writeJson(file, data);
    self.postMessage({ taskId, error: false });
  } catch (error) {
    self.postMessage({ taskId, error: error.valueOf() });
  } finally {
    self.close();
  }
};
