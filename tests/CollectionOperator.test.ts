import {
  CollectionOperator,
  PrimitiveOperator,
} from "../operator/operators.ts";
import {
  assertEquals,
  assertNotEquals,
} from "https://deno.land/std/testing/asserts.ts";

import { Pokemon, pokemon } from "../data/pokemon.ts";

Deno.test("CollectionOperator: instantiates with value", () => {
  const data = [{ id: "1234", name: "foo" }];
  const op = new CollectionOperator(data);

  assertEquals(op.value(), data);
});

Deno.test("CollectionOperator: returns size of array", () => {
  const data = [
    { id: "1", name: "foo" },
    { id: "2", name: "bar" },
  ];
  const op = new CollectionOperator(data);

  assertEquals(op.size(), 2);
});

Deno.test("CollectionOperator: findOne with simple predicate", () => {
  const data = [
    { id: "1", name: "foo" },
    { id: "2", name: "bar" },
  ];
  const op = new CollectionOperator(data);

  assertEquals(op.findOne({ name: "foo" }).value(), { id: "1", name: "foo" });
});

Deno.test("CollectionOperator: findOne with collection result", () => {
  const numbers = new CollectionOperator([[1, 3, 5], [2, 4, 6]]);
  const isEven = (item: number) => item % 2 === 0;
  const isFour = (item: number) => item === 4;

  const evenElements = numbers.findOne((element) => element.some(isEven));

  assertEquals(evenElements instanceof CollectionOperator, true);
  assertEquals(evenElements.value(), [2, 4, 6]);

  if (evenElements instanceof CollectionOperator) {
    const four = evenElements.findOne(isFour);
    assertNotEquals(four.value(), null);

    if (four instanceof PrimitiveOperator) {
      assertEquals(four.value(), 4);
    }
  }
});

Deno.test("CollectionOperator: findOne with cb predicate", () => {
  const data = [
    { id: "1", name: "foo" },
    { id: "2", name: "bar" },
  ];
  const op = new CollectionOperator(data);

  assertEquals(
    op
      .findOne((value) => {
        return value.name !== "foo";
      })
      .value(),
    { id: "2", name: "bar" },
  );
});

Deno.test("CollectionOperator: pushes a value", () => {
  const data = [
    { id: "1", name: "foo" },
    { id: "2", name: "bar" },
  ];
  const op = new CollectionOperator(data);

  assertEquals(op.push({ id: "3", name: "John Doe" }).value(), [
    { id: "1", name: "foo" },
    { id: "2", name: "bar" },
    { id: "3", name: "John Doe" },
  ]);
});

Deno.test("CollectionOperator: findAll with simple predicate", () => {
  const data = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "John Doe" },
  ];
  const op = new CollectionOperator(data);

  assertEquals(op.findAll({ name: "John Doe" }).value(), [
    { id: "1", name: "John Doe" },
    { id: "3", name: "John Doe" },
  ]);
});

Deno.test("CollectionOperator: findAll with cb predicate", () => {
  const data = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "John Doe" },
  ];
  const op = new CollectionOperator(data);

  assertEquals(
    op
      .findAll((value) => {
        return value.name === "John Doe";
      })
      .value(),
    [
      { id: "1", name: "John Doe" },
      { id: "3", name: "John Doe" },
    ],
  );
});

Deno.test("CollectionOperator: sort by certain key(s) or compare function", () => {
  const allPokemon = new CollectionOperator<Pokemon>(pokemon);
  const sortByHeight = (first: Pokemon, second: Pokemon) => {
    return first.height - second.height;
  };
  const sortedByHeight = allPokemon.sort(sortByHeight).pick(["name", "height"])
    .value();
  const sortedByHeightThenWeight = allPokemon.sort(["height", "weight"]).pick(
    ["name", "height", "weight"],
  ).value();

  assertEquals(sortedByHeight, [
    { name: "flabebe", height: 1 },
    { name: "diglett", height: 2 },
    { name: "jirachi", height: 3 },
    { name: "emboar", height: 16 },
    { name: "charizard", height: 17 },
    { name: "typhlosion", height: 17 },
    { name: "garchomp", height: 19 },
    { name: "wailord", height: 145 },
  ]);
  assertEquals(sortedByHeightThenWeight, [
    { name: "flabebe", height: 1, weight: 1 },
    { name: "diglett", height: 2, weight: 8 },
    { name: "jirachi", height: 3, weight: 11 },
    { name: "emboar", height: 16, weight: 1500 },
    { name: "typhlosion", height: 17, weight: 795 },
    { name: "charizard", height: 17, weight: 905 },
    { name: "garchomp", height: 19, weight: 950 },
    { name: "wailord", height: 145, weight: 3980 },
  ]);
});

Deno.test("CollectionOperator: pagination", () => {
  const allPokemon = new CollectionOperator<Pokemon>(pokemon);

  assertEquals(allPokemon.sort(["height"]).page(1, 2).value(), [
    {
      name: "flabebe",
      id: 669,
      weight: 1,
      height: 1,
      types: ["fairy"],
    },
    {
      name: "diglett",
      id: 50,
      weight: 8,
      height: 2,
      types: ["ground"],
    },
  ]);
});

Deno.test("CollectionOperator: pick", () => {
  const allPokemon = new CollectionOperator<Pokemon>(pokemon);

  const result = allPokemon.pick(["name", "id"]).value();

  assertEquals(result, [
    {
      name: "charizard",
      id: 6,
    },
    {
      name: "typhlosion",
      id: 157,
    },
    {
      name: "emboar",
      id: 500,
    },
    {
      name: "garchomp",
      id: 445,
    },
    {
      name: "diglett",
      id: 50,
    },
    {
      name: "jirachi",
      id: 385,
    },
    {
      name: "flabebe",
      id: 669,
    },
    {
      name: "wailord",
      id: 321,
    },
  ]);
});
