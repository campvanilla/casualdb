import { writeJson } from "https://deno.land/std/fs/write_json.ts";

self.onmessage = async (e) => {
  console.log("[Debug] Worker Thread");
  const { file, data } = e.data;
  await writeJson(file, data);
  self.close();
};
