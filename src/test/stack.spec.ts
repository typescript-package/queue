import { Stack as AbstractStack } from "../lib";

export class Stack<Type, Size extends number> extends AbstractStack<Type, Size> {}

console.group(`Stack`);

let stack = new Stack(
  10, // size
  1, 2, 3 // items
);

// The actual stack length.
console.log(`length, `, stack.length); // Output: 3

// Adds a new element on the stack.
stack.push(4); 

// The maximum stack size.
console.log(`size, `, stack.size); // Output: 10

// The actual stack length.
console.log(`length, `, stack.length); // Output: 4

// Returns the top element on the stack.
console.log(`peek(), `, stack.peek()); // Output: 4

// The actual stack `Elements` state.
console.log(`state, `, stack.state); // Output: [1, 2, 3, 4]

// Removes and returns the top element from the stack.
console.log(`pop(), `, stack.pop()); // Output: 4

// The actual stack `Elements` state.
console.log(`state, `, stack.state); // Output: [1, 2, 3]

// Adds to the full.
stack.push(4).push(5).push(6).push(7).push(8).push(9).push(10);

// The actual stack `Elements` state.
console.log(`state, `, stack.state); // Output: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

// Checks if the stack is full.
console.log(`isFull(), `, stack.isFull()); // Output: true

// Clears the queue.
stack.clear()

// The actual stack `Elements` state.
console.log(`state, `, stack.state); // Output: []
console.log(`isEmpty(), `, stack.isEmpty()); // Output: true

console.groupEnd();

describe(`Stack`, () => {
  beforeEach(() => stack = new Stack(10, 1, 2, 3));
  it(`push()`, () => expect(stack.push(4).length).toEqual(4));
  it(`pop()`, () => {
    expect(stack.push(4).length).toEqual(4);
    expect(stack.pop()).toEqual(4);
  });
  it(`peek()`, () => expect(stack.peek()).toEqual(3));
  it(`clear()`, () => expect(stack.clear().length).toEqual(0));
});
