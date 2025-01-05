import { Queue as AbstractQueue } from "../lib";

export class Queue<Type> extends AbstractQueue<Type> {}

let queue = new Queue(Infinity, 1, 2, 3);

describe(`Queue`, () => {
  beforeEach(() => queue = new Queue(Infinity, 1, 2, 3));
  it(`enqueue()`, () => expect(queue.enqueue(4).length).toEqual(4));
  it(`dequeue()`, () => {
    expect(queue.enqueue(4).length).toEqual(4);
    expect(queue.dequeue()).toEqual(1);
  });
  it(`peek()`, () => expect(queue.peek()).toEqual(1));
  it(`clear()`, () => expect(queue.clear().length).toEqual(0));
});
