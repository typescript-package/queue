import { Elements } from "../lib/elements.class";

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

try {
  elements = new Elements([1, 2, 3, 4], 15);
} catch(error) {
  console.log(error);
}

console.log(elements);
