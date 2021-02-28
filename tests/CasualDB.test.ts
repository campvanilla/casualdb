import { CasualDB } from "../mod.ts";
import { assertEquals } from "https://deno.land/std@0.84.0/testing/asserts.ts";
import { emptyDir } from 'https://deno.land/std@0.88.0/fs/mod.ts';

import { blog, Blog } from "../data/blog.ts";

const DIR_TEST_DB = './.casualdb';

Deno.test("casualdb: creates a db and can perform operations on it", async () => {
  const db = new CasualDB<Blog>();
  const timestamp = Date.now();

  await emptyDir(DIR_TEST_DB);
  await db.connect(`${DIR_TEST_DB}/${timestamp}-casual-test.json`);
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
