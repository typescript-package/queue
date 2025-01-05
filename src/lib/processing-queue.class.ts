import { Boolean as Processing } from "@typescript-package/state";
import { Queue } from "./queue.abstract";
/**
 * @description A queue that processes items concurrently with a specified concurrency limit.
 * @export
 * @class ProcessingQueue
 * @template Type
 * @extends {Queue<Type>}
 */
export class ProcessingQueue<Type> extends Queue<Type> {
  /**
   * @description The maximum number of items that can be processed concurrently.
   * @public
   * @readonly
   * @type {number}
   */
  public get concurrency() {
    return this.#concurrency;
  }

  /**
   * @description A set containing all items that have been successfully processed.
   * @public
   * @readonly
   * @type {Set<Type>}
   */
  public get processed() {
    return this.#processed;
  }

  /**
   * @description Privately stored current number of items being processed.
   * @type {number}
   */
  #activeCount: number = 0;

  /**
   * @description Privately stored maximum concurrency level for processing.
   * @type {number}
   */
  #concurrency;

  /**
   * @description Tracks whether the queue is processing items.
   * @type {Processing}
   */
  #processing = new Processing(false);

  /**
   * @description Privately stored set of all processed items.
   * @type {Set<Type>}
   */
  #processed: Set<Type> = new Set();

  /**
   * Creates an instance of child class.
   * @constructor
   * @param {number} [concurrency=1]
   * @param {number} [size=Infinity]
   * @param {...Type[]} items
   */
  constructor(concurrency: number = 1, size: number = Infinity, ...items: Type[]) {
    super(size, ...items);
    this.#concurrency = concurrency;
  }

  /**
   * @description Waits for all items in the queue to be processed and returns the set of processed items.
   * @public
   * @async
   * @returns {Promise<Set<Type>>}
   */
  public async isCompleted(): Promise<Set<Type>> {
    return new Promise<Set<Type>>((resolve, reject) => {
      const interval = setInterval(() => 
        this.#processing.isTrue()
        ? super.length === 0 && this.#processing.false() && resolve(this.#processed)
        : clearInterval(interval)
      , 50);
    });
  }

  /**
   * @description Starts processing items in the queue using the provided callback function.
   * @public
   * @param {(item: Type) => void} callbackFn A function to process each item in the queue.
   * @returns {void) => void}
   */
  public run(callbackFn: (item: Type) => void) {
    this.#processing.true();
    while (this.#activeCount < this.#concurrency && super.length > 0) {
      const item = this.dequeue();
      item && this.#process(item, callbackFn);
    }
  }

  /**
   * @description Processes a single item using the provided callback function.
   * @param {Type} item The item to process.
   * @param {(item: Type) => void} callbackFn A function to process the `item`.
   * @returns {this}
   */
  #process(item: Type, callbackFn: (item: Type) => void): this {
    this.#activeCount++;
    try {
      callbackFn(item);      
    } finally {
      this.#activeCount--;
      this.#processed.add(item);
      this.run(callbackFn);
    }
    return this;
  }
}
