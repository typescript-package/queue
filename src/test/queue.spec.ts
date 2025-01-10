import { Queue as AbstractQueue } from "../lib";

export class Queue<Type, Size extends number> extends AbstractQueue<Type, Size> {}

console.group(`Queue`);

let queue = new Queue(
  10, // size
  1, 2, 3 // item
);

// Adds a new element to the queue.
queue.enqueue(4);

// The actual queue Elements state - raw array state of the queue.
console.log(`state,`, queue.state); // Output: [1, 2, 3, 4]

// Returns the first element in the queue.
console.log(`peek(), `, queue.peek()); // Output: 1

// Checks if the queue is empty.
console.log(`isEmpty(),`, queue.isEmpty()); // Output: false

// The maximum queue size.
console.log(`size,`, queue.size); // Output: 10

// The actual queue Elements state - raw array state of the queue.
console.log(`state,`, queue.state); // Output: [1, 2, 3, 4]

// Adds to the full.
queue.enqueue(5).enqueue(6).enqueue(7).enqueue(8).enqueue(9).enqueue(10);

// Checks whether the queue is full.
console.log(`isFull(), `, queue.isFull()); // Output: true

try {
  queue.enqueue(11);
} catch(error) {
  console.log(error); // Error: Queue is full.
}

// Clears the queue.
console.log(`clear(), `, queue.clear());

// Checks if the queue is empty.
console.log(`isEmpty(),`, queue.isEmpty()); // Output: true

// The actual queue Elements state - raw array state of the queue.
console.log(`state,`, queue.state); // Output: []

console.groupEnd();

describe(`Queue`, () => {
  beforeEach(() => queue = new Queue(10, 1, 2, 3));
  it(`enqueue()`, () => expect(queue.enqueue(4).length).toEqual(4));
  it(`dequeue()`, () => {
    expect(queue.enqueue(4).length).toEqual(4);
    expect(queue.dequeue()).toEqual(1);
  });
  it(`peek()`, () => expect(queue.peek()).toEqual(1));
  it(`clear()`, () => expect(queue.clear().length).toEqual(0));
});
