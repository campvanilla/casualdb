import Operator from './operator.ts';
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test('operator: instantiates with value', () => {
  const data = { id: '1234', name: 'foo' };
  const op = new Operator(data);

  assertEquals(op.value(), data);
});

Deno.test('operator: returns size of array', () => {
  const data = [
    { id: '1', name: 'foo' },
    { id: '2', name: 'bar' },
  ];
  const op = new Operator(data);

  assertEquals(op.size(), 2);
});
