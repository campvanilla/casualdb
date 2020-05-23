import { PrimitiveOperator } from "../operator.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

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