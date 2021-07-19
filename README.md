<p align="center">
  <img src="https://user-images.githubusercontent.com/6426069/82755043-bb65a700-9dee-11ea-9de4-e57476f216db.png" width="300" />
</p>

<p align="center">
  <sub>
    Simple JSON "database" for Deno with type-safety! ⚡️
  </sub>
</p>

<p align="center">
  <strong>WARNING</strong>: This project is still in beta phase. We are actively working on enhancing the API and ironing out kinks. If you find a bug or have a feature request, feel free to create an issue or contribute. 🙂
</p>

![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/campvanilla/casualdb?color=%232ecc71&include_prereleases&style=flat-square) <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Contents

* [Quick Usage](#quick-usage)
* [Installation](#installation)
* [API](#api)
* [Inspiration](#inspiration)
  * [Disclaimer](#disclaimer) ⚠️
* [Contributing](#contributing)

## Quick Usage

``` ts
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

## Installation

``` ts
import { CasualDB } from "https://deno.land/x/casualdb@v0.1.4/mod.ts";

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

Note: When running via deno, this module will require you to pass the following flags (all flags are mandatory):-

* `--allow-read` : in order to be able to **read** the JSON files
* `--allow-write`: in order to be able to **write** to the JSON files
* `--unstable`   : this module uses the experimental Worker API in deno, and hence requires this flag
* `--allow-net`  : this is to enable to download of the Worker file.

If you want to always run the latest code (from the `master` branch) of this module, install via:
```ts
import { CasualDB } from "https://deno.land/x/casualdb/mod.ts";
```

## API

### new CasualDB<Schema>()

Returns an instance of the _CasualDB_. Passing in a interface describing your JSON data ensures that **type checking works correctly**. The following are the methods available on this class instance

* [.connect()](#casual-db-connect)
* [.get()](#casual-db-get)
* [.seed()](#casual-db-seed)
* [.write()](#casual-db-write)

<h4 id='casual-db-connect'>
  <code>.connect(pathToJsonFile: string, options?: ConnectOptions)</code>
</h4>

Creates a _connection_ to a json file passed as parameter. Returns a promise.

ConnectOptions:

  + `bailIfNotPresent` <Boolean>: Controls whether you would like an error to be thrown if the file being connected to does not exist. Default = `false` .

``` ts
await db.connect("./test-db.json");

// or with options

await db.connect("./test-db.json", {
  bailIfNotPresent: true,
});
```

<h4 id='casual-db-get'>
  <code>.get<T>(jsonPath: string)</code>
</h4>

Fetches value from connected JSON file. Takes an object _path_ as parameter. Returns a `Promise<CollectionOperator | PrimitiveOperator>` .
**Important**: For type checking to work, ensure that the Template Type <T> is provided to `.get<T>()` . If this is not provided, typescript cannot decide a _CollectionOperator_ or _PrimitiveOperator_ has been returned and hence you'd have to manually narrow it down for TS.

``` ts
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

<h4 id="casual-db-seed">
  <code>.seed(data: Schema)</code>
</h4>

Overrides the contents of the connected JSON file. This is beneficial for when you don't already have data in the file or you want to add some defaults. Returns a promise.

``` ts
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

<h4 id='casual-db-write'>
  <code>.write(jsonPath: string, data: any)</code>
</h4>

Writes the provided value to the Object path provided. Returns a promise.

``` ts
await db.write('posts', [
  { id: 1, title: "Post 1", views: 99 },
  { id: 2, title: "Post 2", views: 30 },
]);

// or

await db.write('posts.0.title', 'Post 1');
```

### PrimitiveOperator

When performing a `db.get()` on a path that returns a non-array value, the Promise resolves to an instance of `PrimitiveOperator` . The _PrimitiveOperator_ class encapsulates functions that allow you work with any non-array-like data in javascript (eg. `object` , `string` , `number` , `boolean` ). All functions that are a part of _PrimitiveOperator_ allow function chaining.

``` ts
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

Instances of this class have the following methods:

* [.value()](#primitive-operator-value)
* [.update()](#primitive-operator-update)
* [.pick()](#primitive-operator-pick)

<h4 id='primitive-operator-value'>
  <code>.value()</code>
</h4>

Returns the value of the data.

``` ts
const data = await db.get<Schema["posts"][number]>('posts.0');

data.value(); // { id: 1, title: "Post 1", views: 99 }
```

<h4 id='primitive-operator-update'>
  <code>.update<T>(updateMethod: (currentValue) => T)</code>
</h4>

Method to update the data. Method takes an updater-function as parameter. The updater-function will receive the value you want to update and expects a return value. The type of the updated data is inferred by the ReturnType of the updater-function.

``` ts
const data = await db.get<Schema["posts"][number]>('posts.0');

data
  .update((value) => ({
    title: "Modified Post",
  }))
  .value(); // { id: 1, title: "Modified Post" }
```

<h4 id='primitive-operator-pick'>
  .pick(keys: string[])
</h4>

Picks and returns a subset of keys from the data. Method allows only keys present on data. If the data is not an object, method returns the data as is.

``` ts
const data = await db.get<Schema["posts"][number]>('posts.0');

data
  .pick(["id", "title"])
  .value(); // { id: 1, title: "Post 1" }
```

### CollectionOperator

When performing a `db.get()` on a path that returns an array, the Promise resolves to a instance of `CollectionOperator` . The _CollectionOperator_ class encapsulates functions that allow you work with array-like data (collection of items). All functions that are a part of _CollectionOperator_ allow function chaining.

``` ts
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

const data = await db.get<Schema["posts"]>('posts'); // ✅ CollectionOperator as the value is an array.

const data = await db.get<Schema["posts"][number]>('posts.0'); // ❌ PrimitiveOperator as the value is a non-array.
```

Instances of this class contain the following methods. All methods are chainable:

* [.value()](#collection-operator-value)
* [.size()](#collection-operator-size)
* [.findOne()](#collection-operator-findOne)
* [.findAllAndUpdate()](#collection-operator-findAllAndUpdate)
* [.findAllAndRemove()](#collection-operator-findAllAndRemove)
* [.findById()](#collection-operator-findById)
* [.findByIdAndRemove()](#collection-operator-findByIdAndRemove)
* [.findByIdAndUpdate()](#collection-operator-findByIdAndUpdate)
* [.sort()](#collection-operator-sort)
* [.page()](#collection-operator-page)
* [.pick()](#collection-operator-pick)

<h4 id='collection-operator-value'>
  <code>.value()</code>
</h4>

Returns the value of the data.

``` ts
const data = await db.get<Schema["posts"]>('posts');

console.log(data.value()); // [ { id: 1, title: "Post 1", views: 99 }, { id: 2, title: "Post 2", views: 30 }, ]
```

<h4 id='collection-operator-size'>
  <code>.size()</code>
</h4>

Returns the length of the data.

``` ts
const data = await db.get<Schema["posts"]>('posts');

console.log(data.size()); // 2
```

<h4 id='collection-operator-findOne'><code>
.findOne(predicate: Object | Function => boolean)
</code></h4>

Searches through the collection items and returns an item if found, else returns an instance of `PrimitiveOperator<null>` . The predicate can be of two forms:

1. An object with keys that you would like to match. The keys of the object should be a subset of the keys available on the items of the collection.
2. A search-function where you can provide your custom logic and return `true` for the condition you are looking for.

Returns a `PrimitiveOperator` or `CollectionOperator` based on type of the found element.

``` ts
const data = await db.get<Schema["posts"]>('posts');

data
  .findOne({ id: 1 })
  .value();// { id: 1, title: "Post 1", views: 99 }

// or

data
  .findOne((value) => {
    return value.id === 1
  })
  .value(); // { id: 1, title: "Post 1", views: 99 }
```

<h4 id='collection-operator-push'><code>
.push(value)
</code></h4>

Push a new value into the collection. Returns a `CollectionOperator` with the updated items.

``` ts
const data = await db.get<Schema["posts"]>('posts');

data
  .push({ id: 3, post: 'Post 3', views: 45 })
  .value(); // [ { id: 1, title: "Post 1", views: 99 }, { id: 2, title: "Post 2", views: 30 }, { id: 3, title: "Post 3", views: 45 } ]
```

<h4 id='collection-operator-findAll'><code>
.findAll(predicate: Object | Function => boolean)
</code></h4>

Searches through the items of the collection and returns a `CollectionOperator` of all occurrences that satisfy the predicate. The predicate can be of two forms:

1. An object with keys that you would like to match. The keys of the object should be a subset of the keys available on the items of the collection.
2. A search-function where you can provide your custom logic and return `true` for the condition you are looking for.

Returns a `CollectionOperator` with the subset of items.

``` ts
const data = await db.get<Schema["posts"]>('posts');

data
  .findAll({ title: 'Post 1' })
  .value();// [{ id: 1, title: "Post 1", views: 99 }]

// or

data
  .findAll((value) => {
    return value.views > 40;
  })
  .value(); // [{ id: 1, title: "Post 1", views: 99 },{ id: 3, title: "Post 3", views: 45 }];
```

<h4 id='collection-operator-findAllAndUpdate'><code>
.findAllAndUpdate(predicate: Object | Function => boolean, updateMethod: (value) => T)
</code></h4>

Searches through the collection and returns a `CollectionOperator` with all occurrences that satisfy the predicate updated with the return value of the _updateMethod_. The predicate can be of two forms:

1. An object with keys that you would like to match. The keys of the object should be a subset of the keys available on the items of the collection.
2. A search-function where you can provide your custom logic and return `true` for the condition you are looking for.

Returns a `CollectionOperator` with the updated array.

``` ts
const data = await db.get<Schema["posts"]>('posts');

data
  .findAllAndUpdate({ title: 'Post 1' }, (value) => ({ ...value, title: 'Modified Post' }))
  .value(); // [{ id: 1, title: "Modified Post", views: 99 },{ id: 2, title: "Post 2", views: 30 }, { id: 3, title: "Post 3", views: 45 }]

// or

data
  .findAllAndUpdate((value) => {
    return value.views > 40;
  }, (value) => ({
    ...value,
    title: 'Trending Post'
  }))
  .value(); // [{ id: 1, title: "Trending Post", views: 99 }, { id: 2, title: "Post 2", views: 30 }, { id: 3, title: "Trending Post", views: 45 }];
```

<h4 id='collection-operator-findAllAndRemove'><code>
.findAllAndRemove(predicate: Object | Function => boolean, updateMethod: (value) => T)
</code></h4>

Searches through the collection and returns a new `CollectionOperator` where all occurrences that satisfy the predicate are *omitted*. The predicate can be of two forms:

1. An object with keys that you would like to match. The keys of the object should be a subset of the keys available on the items of the collection.
2. A search-function where you can provide your custom logic and return `true` for the condition you are looking for.

Returns a `CollectionOperator` with the updated array.

``` ts
const data = await db.get<Schema["posts"]>('posts');

data
  .findAllAndRemove({ title: 'Post 1' })
  .value(); // [{ id: 2, title: "Post 2", views: 30 }, { id: 3, title: "Post 3", views: 45 }]

// or

data
  .findAllAndRemove((value) => value.views > 40)
  .value(); // [{ id: 2, title: "Post 2", views: 30 }];
```

<h4 id="collection-operator-findById">
<code>.findById(id: string)</code>
</h4>

Syntactical sugar for `.findOne({ id })` .

<h4 id="collection-operator-findByIdAndRemove">
<code>.findByIdAndRemove(id: string)</code>
</h4>

Syntactical sugar for `.findAllAndRemove({ id })` .

<h4 id="collection-operator-findByIdAndUpdate">
<code>.findByIdAndUpdate(id: string, updateMethod: (value) => T)</code>
</h4>

Syntactical sugar for `.findAllAndUpdate({ id }, updateMethod)` .

<h4 id="collection-operator-sort">
<code>.sort(predicate: string[] | Function => boolean)</code>
</h4>

Sorts and returns a new sorted `CollectionOperator` instance. The comparison predicate can be one of two types:

* **an array of keys** to select for sorting the items in the collection (priority is left-right).<br />
  For example, when the predicate is `['views','id']` , the method will first sort *posts* in ascending order of *views* that each post has. Any posts which have the *same* number of views, will then be sorted by `id` .
* a **compare function** similar to [ `Array.prototype.sort` ](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters)'s `compareFunction` .

``` ts
const posts = await db.get<Schema["posts"]>('posts');

posts
  .sort(['views'])
  .value() // [{ id: 2, title: "Post 2", views: 30 }, { id: 1, title: "Post 1", views: 99 }]

// or

posts
  .sort((a,b) => a.views - b.views)
  .value() // [{ id: 2, title: "Post 2", views: 30 }, { id: 1, title: "Post 1", views: 99 }]
```

<h4 id="collection-operator-page">
<code>.page(page: number, pageSize: number)</code>
</h4>

Returns a paginated subset of the collection.

``` ts
const posts = await db.get<Schema["posts"]>('posts');

posts
  .page(1, 1)
  .value() // [{ id: 1, title: "Post 1", views: 99 }]
```

<h4 id="collection-operator-pick">
<code>.pick(keys: string[])</code>
</h4>

Returns a `CollectionOperator` of items with each item having only the *picked* keys. Only keys present on the type of the items in the collection are allowed. If the item is not an object, this method returns an empty object ( `{}` ) for it.

``` ts
const posts = await db.get<Schema["posts"]>('posts');

posts
  .pick(['title'])
  .value() // [{ title: "Post 1" }, { title: "Post 2" }]
```

## Inspiration

This project has taken inspiration from [lowdb](https://github.com/typicode/lowdb) for the concept and [mongoose](https://mongoosejs.com/) for certain parts of the `CollectionOperator` API.

It aims to simplify the process of setting up a full-fledged db when building prototypes or small-scale applications like CLI tools or toy apps for Deno.


### 🚧 ⚠️ Disclaimer ⚠️ 🚧

<a id="disclaimer"></a>

**Disclaimer** : As mentioned above, this module is best used for small-scale apps and should not be used in a large production application and you may face issues like:
* concurrency management (for writes)
* storing and parsing large amounts of JSON data.

## Contributing

Want to raise an issue or pull request? Do give our [Contribution Guidelines](./.github/CONTRIBUTING.md) page a read. 🤓

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://abinavseelan.com/?utm_source=github&utm_medium=documentation-allcontributors&utm_content=casualdb"><img src="https://avatars2.githubusercontent.com/u/6417910?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Abinav Seelan</b></sub></a><br /><a href="https://github.com/campvanilla/casualdb/commits?author=abinavseelan" title="Code">💻</a> <a href="https://github.com/campvanilla/casualdb/commits?author=abinavseelan" title="Documentation">📖</a> <a href="#ideas-abinavseelan" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/campvanilla/casualdb/commits?author=abinavseelan" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://aditimohanty.com/?utm_source=github&utm_medium=documentation-allcontributors&utm_content=casualdb"><img src="https://avatars3.githubusercontent.com/u/6426069?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Aditi Mohanty</b></sub></a><br /><a href="https://github.com/campvanilla/casualdb/commits?author=rheaditi" title="Code">💻</a> <a href="https://github.com/campvanilla/casualdb/commits?author=rheaditi" title="Documentation">📖</a> <a href="#ideas-rheaditi" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/campvanilla/casualdb/commits?author=rheaditi" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://www.willterry.me"><img src="https://avatars0.githubusercontent.com/u/12277149?v=4?s=100" width="100px;" alt=""/><br /><sub><b>William Terry</b></sub></a><br /><a href="https://github.com/campvanilla/casualdb/issues?q=author%3ATezza48" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://yaofur.com/"><img src="https://avatars0.githubusercontent.com/u/289392?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Keith Yao</b></sub></a><br /><a href="https://github.com/campvanilla/casualdb/issues?q=author%3Akebot" title="Bug reports">🐛</a> <a href="https://github.com/campvanilla/casualdb/commits?author=kebot" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/jackfiszr"><img src="https://avatars.githubusercontent.com/u/7147395?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jacek Fiszer</b></sub></a><br /><a href="https://github.com/campvanilla/casualdb/commits?author=jackfiszr" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
