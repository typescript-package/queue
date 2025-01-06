// Class.
import { Boolean as Processing } from "@typescript-package/state";
// Abstract.
import { Queue } from "./queue.abstract";
/**
 * @description A queue that processes elements concurrently with a specified concurrency limit.
 * @export
 * @class ProcessingQueue
 * @template Type
 * @extends {Queue<Type>}
 */
export class ProcessingQueue<
  Type,
  Concurrency extends number = number,
  Size extends number = number
> extends Queue<Type, Size> {
  /**
   * @description The maximum number of elements that can be processed concurrently.
   * @public
   * @readonly
   * @type {number}
   */
  public get concurrency() {
    return this.#concurrency;
  }

  /**
   * @description A set containing all elements that have been successfully processed.
   * @public
   * @readonly
   * @type {Set<Type>}
   */
  public get processed() {
    return this.#processed;
  }

  /**
   * @description Privately stored current number of elements being processed.
   * @type {number}
   */
  #activeCount: number = 0;

  /**
   * @description Privately stored maximum concurrency level for processing.
   * @type {number}
   */
  #concurrency;

  /**
   * @description Tracks whether the queue is processing elements.
   * @type {Processing}
   */
  #processing = new Processing(false);

  /**
   * @description Privately stored set of all processed elements.
   * @type {Set<Type>}
   */
  #processed: Set<Type> = new Set();
  
  /**
   * Creates an instance of child class.
   * @constructor
   * @param {Concurrency} [concurrency=1 as Concurrency] 
   * @param {Size} [size=Infinity as Size] 
   * @param {...Type[]} elements 
   */
  constructor(
    concurrency: Concurrency = 1 as Concurrency,
    size: Size = Infinity as Size,
    ...elements: Type[]
  ) {
    super(size, ...elements);
    this.#concurrency = concurrency;
  }

  /**
   * @description Waits for all elements in the queue to be processed and returns the set of processed elements.
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
   * @description Starts processing elements in the queue using the provided callback function.
   * @public
   * @param {(element: Type) => void} callbackFn A function to process each element in the queue.
   * @returns {void) => void}
   */
  public run(callbackFn: (element: Type) => void) {
    this.#processing.true();
    while (this.#activeCount < this.#concurrency && super.length > 0) {
      const element = this.dequeue();
      element && this.#process(element, callbackFn);
    }
  }

  /**
   * @description Processes a single element using the provided callback function.
   * @param {Type} element The element to process.
   * @param {(element: Type) => void} callbackFn A function to process the `element`.
   * @returns {this}
   */
  #process(element: Type, callbackFn: (element: Type) => void): this {
    this.#activeCount++;
    try {
      callbackFn(element);      
    } finally {
      this.#activeCount--;
      this.#processed.add(element);
      this.run(callbackFn);
    }
    return this;
  }
}
