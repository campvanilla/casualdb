
<img src="https://user-images.githubusercontent.com/6426069/82755043-bb65a700-9dee-11ea-9de4-e57476f216db.png" width="300" />

> Simple JSON "database" for Deno with type-safety!

<p align="center">
  <strong>WARNING</strong>: This project is still in beta phase. We are actively working on enhancing the API and ironing out kinks. If you find a bug or have a feature request, feel free to create an issue or contribute. 🙂
</p>

## Usage

```ts
// create an interface to describe the structure of your JSON
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

const db = new CasualDB<Schema>(); // instantiate the db, casually 🤓
await db.connect("./test-db.json"); // "connect" to the db (JSON file)

// (optional) seed it with data, if starting with an empty db
await db.seed({
  posts: [
    { id: 1, title: "Post 1", views: 99 },
    { id: 2, title: "Post 2", views: 30 },
  ],
  user: { name: "Camp Vanilla" },
});

const posts = await db.get<Schema['posts']>('posts'); // pass the interface key in order for type-checking to work

const postTitlesByViews = (
  posts
    .sort(['views']) // sort by views (ascending)
    .pick(['title']) // pick the title of every post
    .value() // => ['Post 2', 'Post 1']
);
```

### Inspiration

This project has taken inspiration from [lowdb](https://github.com/typicode/lowdb) and [mongoose](https://mongoosejs.com/). <TODO: Add need>


## Installation

```ts
import { CasualDB } from "https://github.com/campvanilla/casualdb/blob/master/mod.ts";

// create an interface to describe the structure of your JSON
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
```

## API

### new CasualDB<Schema>()

Returns an instance of the _CasualDB_. Passing in a interface describing your JSON data ensures that **type checking works correctly**. The following are the methods available on this class instance

**.connect(pathToJsonFile: string, options?: ConnectOptions)**

Creates a _connection_ to a json file passed as parameter. Returns a promise.

ConnectOptions:
  * `bailIfNotPresent` <Boolean>: Controls whether you would like an error to be thrown if the file being connected to does not exist. Default = `false`.

```ts
await db.connect("./test-db.json");

// or with options

await db.connect("./test-db.json", {
  bailIfNotPresent: true,
});

```

**.get<T>(jsonPath: string)**

Fetches value from connected JSON file. Takes an object _path_ as parameter. Returns a `Promise<CollectionOperator | PrimitiveOperator>`.
**Important**: For type checking to work, ensure that the Template Type <T> is provided to `.get<T>()`. If this is not provided, typescript cannot decide a _CollectionOperator_ or _PrimitiveOperator_ has been returned and hence you'd have to manually narrow it down for TS.


```ts
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

await db.get<Schema["posts"]>('posts'); // Returns a Promise<CollectionOperator>

// or

await db.get<Schema["posts"][number]["id"]>('posts.0.id'); // Returns a Promise<PrimitiveOperator>
```

**.seed(data: Schema)**

Adds / overrides the contents of the connected JSON file. This is beneficial for when you don't already have data in the file or you want to add some defaults. Returns a promise.

```ts
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

await db.seed({
  posts: [
    { id: 1, title: "Post 1", views: 99 },
    { id: 2, title: "Post 2", views: 30 },
  ],
  user: { name: "Camp Vanilla" },
});
```

**.write(jsonPath: string, data: any)**

Writes the provided value to the Object path provided. Returns a promise.

```ts
await db.write('posts', [
  { id: 1, title: "Post 1", views: 99 },
  { id: 2, title: "Post 2", views: 30 },
]);

// or

await db.write('posts.0.title', 'Post 1');
```

### PrimitiveOperator

When performing a `db.get()` on a path that returns a non-array value, the Promise resolves to a `PrimitiveOperator`. The _PrimitiveOperator_ class encapsulates functions that allow you work with the data. All functions that are a part of _PrimitiveOperator_ enable function chaining.

```ts
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

const data = await db.get<Schema["posts"]>('posts'); // ❌ Not a PrimitiveOperator as the value is going to be an array

const data = await db.get<Schema["posts"][number]>('posts.0'); // ✅ PrimitiveOperator as the value is a non-array.
```

**.value()**

Returns the value of the data.

```ts
const data = await db.get<Schema["posts"][number]>('posts.0');

console.log(data.value());
```

**.update<T>(updateMethod: (currentValue) => T)**

Method to update the data. Method takes an updater-function as parameter. The updater-function will receive the value you want to update and expects a return value. The type of the updated data is inferred by the ReturnType of the updater-function.

```ts
const data = await db.get<Schema["posts"][number]>('posts.0');

data
  .update((value) => ({
    title: "Modified Post",
  }))
  .value(),
```

**.pick(keys: string[])**

Picks and returns a subset of keys from the data. Method allows only keys present on data. If the data is not an object, method returns the data as is.

```ts
const data = await db.get<Schema["posts"][number]>('posts.0');

console.log(data.pick(["id", "title"]));
```
