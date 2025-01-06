import { Processing } from "../lib/processing.class";

const processing = new Processing(3);

processing.asyncRun(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  element => console.log(`Processed element: `, element),
  error => console.log(`Error`, error),
  'default'
);

