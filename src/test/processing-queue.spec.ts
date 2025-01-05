import { ProcessingQueue as AbstractProcessingQueue } from "../lib";

export class ProcessingQueue<Type> extends AbstractProcessingQueue<Type> {}

let queue = new ProcessingQueue(2, Infinity, 1, 2, 3);

describe(`ReverseQueue`, () => {
  beforeEach(() => queue = new ProcessingQueue(2, Infinity, 1, 2, 3));
  it(`enqueue()`, () => expect(queue.enqueue(4).length).toEqual(4));
  it(`dequeue()`, () => {
    expect(queue.enqueue(4).length).toEqual(4);
    expect(queue.dequeue()).toEqual(1);
    expect(queue.dequeue()).toEqual(2);
  });
  it(`peek()`, () => expect(queue.peek()).toEqual(1));
  it(`clear()`, () => expect(queue.clear().length).toEqual(0));
});
