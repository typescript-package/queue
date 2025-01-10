// Abstract.
import { Queue } from "./queue.abstract";
// Class.
import { Processing } from "./processing.class";
// Type.
import { ErrorCallback, ProcessCallback } from "../type";
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
   * @description
   * @public
   * @readonly
   * @type {Processing<Type, Concurrency>}
   */
  public get processing(): Processing<Type, Concurrency> {
    return this.#processing;
  }

  /**
   * @description
   * @type {Processing<Type, Concurrency>}
   */
  #processing;
  
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
    this.#processing = new Processing<Type, Concurrency>(concurrency);
  }

  /**
   * @description Checks whether the queue processing is completed.
   * @public
   * @returns {boolean} 
   */
  public isCompleted(): boolean {
    return super.length === 0 && this.#processing.activeCount === 0 && this.#processing.isActive(false);
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
        this.#processing.isActive()
        ? super.length === 0 && resolve(this.#processing.processed)
        : clearInterval(interval)
      , 50);
    });
  }

  public async asyncRun(
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>,
  ): Promise<void> {
    const activeProcesses: Promise<void>[] = [];
    const process = async (): Promise<void> => {
      while (this.#processing.activeCount < this.#processing.concurrency && super.length > 0) {
        const element = this.dequeue();
        if (element) {
          const task = this.#processing.asyncProcess(element, callbackFn, onError).finally(() => process());  
          activeProcesses.push(task);
          await activeProcesses;
        }
      }
    }
    await process();
    await this.#processing.complete();
  }
  //#endregion Public async

  /**
   * @description Starts processing elements in the queue using the provided callback function.
   * @public
   * @param {(element: Type) => void} callbackFn A function to process each element in the queue.
   * @param {?(element: Type, error: unknown) => void} [onError] An optional function to handle the error.
   * @returns {void) => void}
   */
  public run(callbackFn: (element: Type) => void, onError?: (element: Type, error: unknown) => void) {
    while (super.length > 0) {
      this.#processing.process(this.dequeue(), callbackFn, onError);
    }
  }
}
