# casualdb

> Simple JSON "database" for Deno with type-safety!

## This project is still a Work-In-Progress 🚧

## Usage

```ts
// instantiate with a schema describing the structure of your JSON.
const db = new CasualDB<{
  posts: Array<{
    id: number;
    title: string;
    views: number;
  }>;
  user: {
    name: string;
  };
}>();

// "connect" to the db (JSON file)
await db.connect("./test-db.json");

// seed it with data (optional: if starting with an empty db)
await db.seed({
  posts: [
    { id: 1, title: "Post 1", views: 99 },
    { id: 2, title: "Post 2", views: 30 },
  ],
  user: { name: "Camp Vanilla" },
});

db.get('posts')
  .sort(['views']) // sort by views (ascending)
  .pick(['title']) // pick the title of every post
  .value() // => ['Post 2', 'Post 1']
```
