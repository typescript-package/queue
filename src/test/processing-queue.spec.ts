import { ProcessingQueue as AbstractProcessingQueue } from "../lib";

export class ProcessingQueue<Type> extends AbstractProcessingQueue<Type> {}

console.group(`ProcessingQueue`);

// Initialize the `ProcessingQueue`.
let processingQueue = new ProcessingQueue(
  2, // concurrency
  10, // size
  1, 2, 3 // items
);

// The maximum number of elements that can be processed concurrently.
console.log(`concurrency, `, processingQueue.concurrency); // Output: 2

// A set containing all elements that have been successfully processed.
console.log(`processed, `, processingQueue.processed); // Output: Set(0)

// Checks whether the queue is empty.
console.log(`isEmpty(), `, processingQueue.isEmpty()); // Output: false

// Checks whether the queue is full.
console.log(`isFull(), `, processingQueue.isFull()); // Output: false

// The maximum queue size.
console.log(`size, `, processingQueue.size); // Output: 10

// The actual queue Elements state - raw array state of the queue.
console.log(`state, `, processingQueue.state); // Output: [1, 2, 3]

// The actual queue length.
console.log(`length, `, processingQueue.length); // Output: 3

// Adds a new element to the queue.
console.log(`enqueue(4), `, processingQueue.enqueue(4));

// The actual queue length.
console.log(`length, `, processingQueue.length); // Output: 4

// Returns the first element in the queue.
console.log(`peek(), `, processingQueue.peek()); // Output: 1

// Returns the first element in the queue.
console.log(`dequeue(), `, processingQueue.dequeue()); // Output: 1

// The actual queue length.
console.log(`length, `, processingQueue.length); // Output: 3

// Adds to the full.
processingQueue.enqueue(5).enqueue(6).enqueue(7).enqueue(8).enqueue(9).enqueue(10).enqueue(11);

// The actual queue Elements state - raw array state of the queue.
console.log(`state, `, processingQueue.state); // Output: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

// Waits for all elements in the queue to be processed and returns the set of processed elements.
processingQueue.isCompleted().then(
  processed => console.log(`Completed`, processed), // Output: Completed Set(10)
  reason => console.log(reason)
);

// Starts processing elements in the queue using the provided callback function.
processingQueue.run(element => console.log(`Processed`, element)); // Output: Processed {element}

// A set containing all elements that have been successfully processed.
console.log(`processed, `, processingQueue.processed); // Output: Set(10)

console.groupEnd();

describe(`ReverseQueue`, () => {
  beforeEach(() => processingQueue = new ProcessingQueue(2, 10, 1, 2, 3));
  it(`enqueue()`, () => expect(processingQueue.enqueue(4).length).toEqual(4));
  it(`dequeue()`, () => {
    expect(processingQueue.enqueue(4).length).toEqual(4);
    expect(processingQueue.dequeue()).toEqual(1);
    expect(processingQueue.dequeue()).toEqual(2);
  });
  it(`peek()`, () => expect(processingQueue.peek()).toEqual(1));
  it(`clear()`, () => expect(processingQueue.clear().length).toEqual(0));
});
