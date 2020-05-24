import { CasualDB } from "../mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("casualdb: sanity with posts & users", async () => {
  interface Schema {
    posts: Array<{
      id: number;
      title: string;
      views: number;
    }>;
    user: {
      name: string;
    };
  }

  const db = new CasualDB<Schema>();

  // "connect" to the db (JSON file)
  await db.connect("./test-db.json");

  const posts = await db.get<Schema["posts"]>("posts");

  const postTitlesByViews = posts.sort(["views"]).pick(["title"]);

  assertEquals(
    postTitlesByViews.value(),
    [{ title: "Post 2" }, { title: "Post 1" }],
  );
});
