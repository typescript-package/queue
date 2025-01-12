import { Tasks } from '../lib/tasks.class';

console.group(`Tasks`);

let tasks = new Tasks<number>(true, 3);

tasks.debug().asyncRun(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  element => {},
  () => {},
  element => {},
  'default'
).then(processed => {
  console.log(`----------> Tasks then()`, processed);
}).finally(() => {
  console.log(`----------> Tasks finally()`);
})

console.log(`---`)
console.groupEnd();

describe(`Tasks`, () => {
  beforeEach(() => {
    tasks = new Tasks<number>(true, 3);
  });
  it(`process()`, () => {
    tasks.process(5, element => {});
    expect(tasks.processed.size).toEqual(1);
  });
  it(`concurrency`, () => {
    expect(tasks.concurrency).toEqual(3);
  });
});
