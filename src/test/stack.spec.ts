import { Stack as AbstractStack } from "../lib";

export class Stack<Type> extends AbstractStack<Type> {}

let queue = new Stack(Infinity, 1, 2, 3);

describe(`ReverseQueue`, () => {
  beforeEach(() => queue = new Stack(Infinity, 1, 2, 3));
  it(`enqueue()`, () => expect(queue.push(4).length).toEqual(4));
  it(`pop()`, () => {
    expect(queue.push(4).length).toEqual(4);
    expect(queue.pop()).toEqual(4);
  });
  it(`peek()`, () => expect(queue.peek()).toEqual(3));
  it(`clear()`, () => expect(queue.clear().length).toEqual(0));
});
