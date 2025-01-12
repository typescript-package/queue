import { TaskQueue as AbstractTaskQueue } from "../lib";

export class TaskQueue<Type> extends AbstractTaskQueue<Type> {}

let taskQueue = new TaskQueue(
  3, // concurrency
  25, // size
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 // items
);

taskQueue
  .asyncRun((element) => console.log(`TaskQueue processed, `, element, taskQueue.state))
  .then((processed) => {
    console.log(`---TaskQueue then()`, taskQueue.state);
    console.log(`----------> Tasks then()`, processed);
  })
  .finally(() => {
    console.log(`TaskQueue finally`, taskQueue.state);
  });

console.group(`TaskQueue`);

// Initialize the `TaskQueue`.
taskQueue = new TaskQueue(
  3, // concurrency
  10, // size
  1, 2, 3 // items
);

// The maximum number of elements that can be processed concurrently.
console.log(`concurrency, `, taskQueue.concurrency); // Output: 2

// A set containing all elements that have been successfully processed.
console.log(`processed, `, taskQueue.processed); // Output: Set(0)

// Checks whether the queue is empty.
console.log(`isEmpty(), `, taskQueue.isEmpty()); // Output: false

// Checks whether the queue is full.
console.log(`isFull(), `, taskQueue.isFull()); // Output: false

// The maximum queue size.
console.log(`size, `, taskQueue.size); // Output: 10

// The actual queue Elements state - raw array state of the queue.
console.log(`state, `, taskQueue.state); // Output: [1, 2, 3] // TODO:

// The actual queue length.
console.log(`length, `, taskQueue.length); // Output: 3

// Adds a new element to the queue.
console.log(`enqueue(4), `, taskQueue.enqueue(4));

// The actual queue length.
console.log(`length, `, taskQueue.length); // Output: 4

// Returns the first element in the queue.
console.log(`peek(), `, taskQueue.peek()); // Output: 1

// Returns the first element in the queue.
console.log(`dequeue(), `, taskQueue.dequeue()); // Output: 1

// The actual queue length.
console.log(`length, `, taskQueue.length); // Output: 3

// Adds to the full.
taskQueue.enqueue(5).enqueue(6).enqueue(7).enqueue(8).enqueue(9).enqueue(10).enqueue(11);

// The actual queue Elements state - raw array state of the queue.
console.log(`state, `, taskQueue.state); // Output: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

// Waits for all elements in the queue to be processed and returns the set of processed elements.
taskQueue.onCompleted().then(
  processed => console.log(`TaskQueue completed`, processed), // Output: Completed Set(10)
  reason => console.log(reason)
);

// Starts processing elements in the queue using the provided callback function.
// processingQueue.run(element => console.log(`Processed. `, element)); // Output: Processed {element}

taskQueue.asyncRun(element => console.log(`TaskQueue processed. `, element)).finally(() => console.log(`TaskQueue async Run Completed.`)); // Output: Processed {element}

// A set containing all elements that have been successfully processed.
console.log(`processed, `, taskQueue.processed); // Output: Set(10)

console.groupEnd();

describe(`TaskQueue`, () => {
  beforeEach(() => taskQueue = new TaskQueue(2, 10, 1, 2, 3));
  it(`enqueue()`, () => expect(taskQueue.enqueue(4).length).toEqual(4));
  it(`dequeue()`, () => {
    expect(taskQueue.enqueue(4).length).toEqual(4);
    expect(taskQueue.dequeue()).toEqual(1);
    expect(taskQueue.dequeue()).toEqual(2);
  });
  it(`peek()`, () => expect(taskQueue.peek()).toEqual(1));
  it(`clear()`, () => expect(taskQueue.clear().length).toEqual(0));
});
