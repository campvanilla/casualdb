import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { PrimitiveOperator } from "../operator/operators.ts";
import { Pokemon, pokemon } from "../data/pokemon.ts";

Deno.test("PrimitiveOperator: instantiates with value", () => {
  const data = { id: "1234", name: "foo" };
  const op = new PrimitiveOperator(data);

  assertEquals(op.value(), data);
});

Deno.test("PrimitiveOperator: updates a value", () => {
  const data = {
    name: "John Doe",
  };

  const op = new PrimitiveOperator(data);

  assertEquals(
    op
      .update((value) => ({
        name: "Jane Doe",
      }))
      .value(),
    {
      name: "Jane Doe",
    },
  );
});

Deno.test("PrimitiveOperator: picks object keys", () => {
  const rawPokemon = pokemon[0];

  const op = new PrimitiveOperator<Pokemon>(rawPokemon);
  const charredPokemon = op.pick(["name", "weight"]);

  assertEquals(
    charredPokemon.value(),
    { name: rawPokemon.name, weight: rawPokemon.weight },
  );
});
