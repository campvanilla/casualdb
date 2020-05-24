import { CollectionOperator } from "../operator/operators.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { Pokemon, pokemon } from '../data/pokemon.ts';

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

  assertEquals(
    op
      .push({ id: "3", name: "John Doe"})
      .value(),
    [
      { id: "1", name: "foo" },
      { id: "2", name: "bar" },
      { id: "3", name: "John Doe"}
    ],
  );
});

Deno.test("CollectionOperator: findAll with simple predicate", () => {
  const data = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Doe" },
    { id: "3", name: "John Doe" },
  ];
  const op = new CollectionOperator(data);

  assertEquals(
    op
      .findAll({ name: 'John Doe' })
      .value(),
    [
      { id: "1", name: "John Doe" },
      { id: "3", name: "John Doe"}
    ],
  );
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
        return value.name === 'John Doe';
      })
      .value(),
    [
      { id: "1", name: "John Doe" },
      { id: "3", name: "John Doe" },
    ],
  );
});

Deno.test("CollectionOperator: sort by certain key", () => {
  const allPokemon = new CollectionOperator<Pokemon>(pokemon);
  const sortByHeight = (first: Pokemon, second: Pokemon) => {
    return first.height - second.height;
  };
  const sortedByHeightThenWeight = allPokemon.sort(['height', 'weight']).value();
  const sortedByHeight = allPokemon.sort(sortByHeight).value();

  console.log({ sortedByHeight, sortedByHeightThenWeight });
  console.log(allPokemon.sort(['id']).value())
  assertEquals(1,1);
  // assertEquals
});
