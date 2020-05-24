import { CasualDB } from "../mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { blog, Blog } from "../data/blog.ts";

Deno.test("casualdb: creates a db and can perform operations on it", async () => {
  const db = new CasualDB<Blog>();
  const timestamp = Date.now();

  await db.connect(`./.casualdb/${timestamp}-casual-test.json`);
  await db.seed(blog);

  const posts = await db.get<Blog["posts"]>("posts");
  const postTitlesByViews = posts.sort(["views"]).pick(["title"]);

  assertEquals(
    postTitlesByViews.value(),
    [
      { title: "Color Me Addams" },
      { title: "Hand Delivered" },
      { title: "Little Doll Lost" },
    ],
  );
});
