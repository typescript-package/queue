
<a href="https://www.typescriptlang.org/">
  <img
    src="https://raw.githubusercontent.com/typescript-package/core/refs/heads/main/ts-package-barcode-logo-512.png"
    width="20%"
    title="@typescript-package/queue"
  />
</a>

## typescript-package/queue

A lightweight TypeScript library for managing various queue and stack structures.

<!-- npm badge -->
[![npm version][typescript-package-npm-badge-svg]][typescript-package-npm-badge]
[![GitHub issues][typescript-package-badge-issues]][typescript-package-issues]
[![GitHub license][typescript-package-badge-license]][typescript-package-license]

<br>

## Table of contents

* [Installation](#installation)
* [Api](#api)
  * [`Elements`](#elements)
  * [`ProcessingQueue`](#processingqueue)
  * [`Processing`](#processing)
  * [`Queue`](#queue)
  * [`Stack`](#stack)
* [Git](#git)
  * [Commit](#commit)
  * [Versioning](#versioning)
* [License](#license)

## Installation

```bash
npm install @typescript-package/queue
```

## Api

```typescript
import {
  // Class.
  Elements,
  // Abstract.
  ProcessingQueue,
  Queue,
  Stack
} from '@typescript-package/queue';
```

### `Elements`

```typescript
import { Elements } from '@typescript-package/queue';

let elements = new Elements(
  [1, 2, 3, 4], // Array type elements.
  15 // Maximum size of the elements.
);

// Appends the value at the end of an array state.
elements.append(5);
console.log(elements.state); // Output: [1, 2, 3, 4, 5]

// Inserts the value at the specified index into the array state.
elements.insert(2, 10);
console.log(elements.state); // Output: [1, 2, 10, 3, 4, 5]

// Adds the values at the beginning of array state.
elements.prepend(0);
console.log(elements.state); // Output: [0, 1, 2, 10, 3, 4, 5]

// Updates the value at the index in the array state.
elements.update(0, 127);
console.log(elements.state); // Output: [127, 1, 2, 10, 3, 4, 5]
```

### `ProcessingQueue`

```typescript
import { ProcessingQueue } from '@typescript-package/queue';

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
```

### `Processing`

### `Queue`

```typescript
import { Queue } from '@typescript-package/queue';

// Initialize the new `Queue`.
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

```

### `Stack`

```typescript
import { Stack } from '@typescript-package/queue';

// Initialize the `Stack`.
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
```

## GIT

### Commit

* [AngularJS Git Commit Message Conventions][git-commit-angular]
* [Karma Git Commit Msg][git-commit-karma]
* [Conventional Commits][git-commit-conventional]

### Versioning

[Semantic Versioning 2.0.0][git-semver]

**Given a version number MAJOR.MINOR.PATCH, increment the:**

* MAJOR version when you make incompatible API changes,
* MINOR version when you add functionality in a backwards-compatible manner, and
* PATCH version when you make backwards-compatible bug fixes.

Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR.PATCH format.

**FAQ**
How should I deal with revisions in the 0.y.z initial development phase?

> The simplest thing to do is start your initial development release at 0.1.0 and then increment the minor version for each subsequent release.

How do I know when to release 1.0.0?

> If your software is being used in production, it should probably already be 1.0.0. If you have a stable API on which users have come to depend, you should be 1.0.0. If you’re worrying a lot about backwards compatibility, you should probably already be 1.0.0.

## License

MIT © typescript-package ([license][typescript-package-license])

<!-- This package: typescript-package  -->
  <!-- GitHub: badges -->
  [typescript-package-badge-issues]: https://img.shields.io/github/issues/typescript-package/queue
  [isscript-package-badge-forks]: https://img.shields.io/github/forks/typescript-package/queue
  [typescript-package-badge-stars]: https://img.shields.io/github/stars/typescript-package/queue
  [typescript-package-badge-license]: https://img.shields.io/github/license/typescript-package/queue
  <!-- GitHub: badges links -->
  [typescript-package-issues]: https://github.com/typescript-package/queue/issues
  [typescript-package-forks]: https://github.com/typescript-package/queue/network
  [typescript-package-license]: https://github.com/typescript-package/queue/blob/master/LICENSE
  [typescript-package-stars]: https://github.com/typescript-package/queue/stargazers
<!-- This package -->

<!-- Package: typescript-package -->
  <!-- npm -->
  [typescript-package-npm-badge-svg]: https://badge.fury.io/js/@typescript-package%2Fqueue.svg
  [typescript-package-npm-badge]: https://badge.fury.io/js/@typescript-package%2Fqueue

<!-- GIT -->
[git-semver]: http://semver.org/

<!-- GIT: commit -->
[git-commit-angular]: https://gist.github.com/stephenparish/9941e89d80e2bc58a153
[git-commit-karma]: http://karma-runner.github.io/0.10/dev/git-commit-msg.html
[git-commit-conventional]: https://www.conventionalcommits.org/en/v1.0.0/
