// import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

// import { Value, CollectionOperator } from './altoperator.ts';
// import { ID } from './types.ts';

// Deno.test('what', () => {
//   type Posts = {
//     id: ID;
//     title: string;
//     likes: number;
//   }

//   const posts: Posts[] = [{
//     id: 1,
//     title: 'Hello World?',
//     likes: 5,
//   }, {
//     id: 2,
//     title: 'Bye!',
//     likes: 10,
//   }];

//   const op = new CollectionOperator(posts);

//   assertEquals(op.find({ title: 'Bye!' }).value(),  {
//     id: 2,
//     title: 'Bye!',
//     likes: 10,
//   });

//   assertEquals(op.findById(1).value(), {
//     id: 1,
//     title: 'Hello World?',
//     likes: 5,
//   });

//   const eachWithMoreLikes = op.update(item => ({ ...item, likes: item.likes + 1, yolo: true}))

//   assertEquals(eachWithMoreLikes.findById(1).value()?.likes, 6);
//   // const
//   // assertEquals(
//   //   ;
//   // )
// });
