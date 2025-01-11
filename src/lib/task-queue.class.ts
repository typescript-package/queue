// Abstract.
import { Queue } from "./queue.abstract";
// Class.
import { Processing } from "./processing.class";
import { Tasks } from "./tasks.class";
// Type.
import { ErrorCallback, ProcessCallback } from "../type";
/**
 * @description A queue that processes elements concurrently with a specified concurrency limit.
 * @export
 * @class ProcessingQueue
 * @template Type
 * @extends {Queue<Type>}
 */
export class TaskQueue<
  Type,
  Concurrency extends number = number,
  Size extends number = number
> extends Queue<Type, Size> {
  /**
   * @description
   * @public
   * @readonly
   * @type {Concurrency}
   */
  public get concurrency() {
    return this.#tasks.concurrency;
  }

  /**
   * @description
   * @public
   * @readonly
   * @type {Set<Type>}
   */
  public get processed(): Set<Type> {
    return this.#tasks.processed;
  }

  /**
   * @description
   * @public
   * @readonly
   * @type {Processing<Type, Concurrency>}
   */
  public get processing(): Processing {
    return this.#tasks.processing;
  }

  /**
   * @description
   * @type {Tasks<Type, Concurrency>}
   */
  #tasks;
  
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
    this.#tasks = new Tasks<Type, Concurrency>(true, concurrency);
  }

  /**
   * @description Checks whether the queue processing is completed.
   * @public
   * @returns {boolean} 
   */
  public isCompleted(): boolean {
    return super.length === 0 && this.#tasks.processing.activeCount === 0 && this.#tasks.processing.isActive(false);
  } 
  
  //#region Public async
  /**
   * @description Waits for all elements in the queue to be processed and returns the set of processed elements.
   * @public
   * @async
   * @returns {Promise<Set<Type>>}
   */
  public async onCompleted(): Promise<Set<Type>> {
    return new Promise<Set<Type>>((resolve, reject) => {
      const interval = setInterval(() => 
        this.#tasks.processing.isActive()
        ? super.length === 0 && resolve([] as any) // TODO: this.#tasks.processed
        : clearInterval(interval)
      , 50);
    });
  }

  public async asyncRun(
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>,
  ): Promise<Set<Type>> {
    const process = async () => {
      while (this.#tasks.processing.activeCount < this.#tasks.concurrency && super.length > 0) {
        const element = this.dequeue();
        if (element) {
          const task = this.#tasks
            .asyncProcess(element, callbackFn, onError)
            .finally(() => (this.#tasks.processing.delete(task), process()));
          this.#tasks.processing.add(task, false);
        }
      }
      this.#tasks.processing.activeCount > 0 && await Promise.all(this.#tasks.processing.state);
    }
    await process();
    await this.#tasks.processing.complete();
    return this.#tasks.processed;
  }
  // #endregion Public async

  /**
   * @description Starts processing elements in the queue using the provided callback function.
   * @public
   * @param {(element: Type) => void} callbackFn A function to process each element in the queue.
   * @param {?(element: Type, error: unknown) => void} [onError] An optional function to handle the error.
   * @returns {void) => void}
   */
  public run(callbackFn: (element: Type) => void, onError?: (element: Type, error: unknown) => void) {
    while (super.length > 0) {
      this.#tasks.process(this.dequeue(), callbackFn, onError);
    }
  }
}
