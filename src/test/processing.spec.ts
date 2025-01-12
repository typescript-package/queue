import { Processing } from "../lib/processing.class";

let processing = new Processing();

describe(`Processing`, () => {
  beforeEach(() => {
    processing = new Processing()
      // .debug();
  });
  it(`add()`, () => {
    processing.add(new Promise((resolve, reject) => resolve()));
    expect(processing.activeCount).toEqual(1);
    expect(processing.active).toBeTrue();
  });
  it(`add(promise, false) + delete() + active + isActive()`, () => {
    processing.add(new Promise((resolve, reject) => resolve()), false);
    expect(processing.activeCount).toEqual(1);
    expect(processing.active).toBeTrue();

    processing.add(new Promise((resolve, reject) => resolve()), false);
    expect(processing.activeCount).toEqual(2);
    expect(processing.active).toBeTrue();
    expect(processing.isActive()).toBeTrue();
    expect(processing.isActive(true)).toBeTrue();
    expect(processing.isActive(false)).toBeFalse();

    processing.add(new Promise((resolve, reject) => resolve()), false);
    expect(processing.activeCount).toEqual(3);
    expect(processing.active).toBeTrue();
    expect(processing.isActive()).toBeTrue();
    expect(processing.isActive(true)).toBeTrue();
    expect(processing.isActive(false)).toBeFalse();

    processing.delete();
    expect(processing.activeCount).toEqual(2);
    expect(processing.active).toBeTrue();
    expect(processing.isActive()).toBeTrue();
    expect(processing.isActive(true)).toBeTrue();
    expect(processing.isActive(false)).toBeFalse();

    processing.delete();
    expect(processing.activeCount).toEqual(1);
    expect(processing.active).toBeTrue();
    expect(processing.isActive()).toBeTrue();
    expect(processing.isActive(true)).toBeTrue();
    expect(processing.isActive(false)).toBeFalse();

    processing.delete();
    expect(processing.activeCount).toEqual(0);
    expect(processing.active).toBeFalse();
    expect(processing.isActive()).toBeFalse();
    expect(processing.isActive(true)).toBeFalse();
    expect(processing.isActive(false)).toBeTrue();

    processing.complete().finally(() => {
      expect(true).toBeTrue();
      console.log(`Processing.activeCount:`, processing.activeCount);
    });
  });
});
