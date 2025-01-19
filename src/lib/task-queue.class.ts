// Abstract.
import { Queue } from "./queue.abstract";
// Class.
import { Processing } from "./processing.class";
import { Tasks } from "./tasks.class";
// Type.
import { ErrorCallback, FailureCallback, ProcessCallback, SuccessCallback } from "@typedly/callback";
// Enum.
import { Processed } from "../enum/processed.enum";
/**
 * @description A task queue that processes elements concurrently with a specified concurrency limit.
 * @export
 * @class TaskQueue
 * @template Element 
 * @template {number} [Concurrency=number] 
 * @template {number} [Size=number] 
 * @extends {Queue<Element, Size>}
 */
export class TaskQueue<
  Element,
  Concurrency extends number = number,
  Size extends number = number
> extends Queue<Element, Size> {
  /**
   * @description The maximum number of elements that can be processed concurrently.
   * @public
   * @readonly
   * @type {Concurrency}
   */
  public get concurrency() {
    return this.#tasks.concurrency;
  }

  /**
   * @description Returns the processed elements.
   * @public
   * @readonly
   * @type {Set<Element>}
   */
  public get processed(): Set<Element> {
    return this.#tasks.processed;
  }

  /**
   * @description Returns the `Processing` object that contains active tasks.
   * @public
   * @readonly
   * @type {Processing<Element, Concurrency>}
   */
  public get processing(): Processing {
    return this.#tasks.processing;
  }

  /**
   * @description The `Tasks` object to handle the processing.
   * @type {Tasks<Element, Concurrency>}
   */
  #tasks;
  
  /**
   * Creates an instance of child class.
   * @constructor
   * @param {Concurrency} [concurrency=1 as Concurrency] 
   * @param {Size} [size=Infinity as Size] 
   * @param {...Element[]} elements 
   */
  constructor(
    concurrency: Concurrency = 1 as Concurrency,
    size: Size = Infinity as Size,
    ...elements: Element[]
  ) {
    super(size, ...elements);
    this.#tasks = new Tasks<Element, Concurrency>(true, concurrency);
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
   * @returns {Promise<Set<Element>>}
   */
  public async onCompleted(): Promise<Set<Element>> {
    return new Promise<Set<Element>>((resolve, reject) => {
      const interval = setInterval(() => 
        this.#tasks.processing.isActive()
        ? super.length === 0 && resolve([] as any) // TODO: this.#tasks.processed
        : clearInterval(interval)
      , 50);
    });
  }

  /**
   * @description Starts asynchronous processing queue elements with concurrency control.
   * @public
   * @async
   * @param {ProcessCallback<Element, void | Promise<void> | Processed>} callbackFn The function to process each element.
   * @param {?SuccessCallback<Element>} [onSuccess] An optional success handler.
   * @param {?FailureCallback<Element>} [onFailure] An optional failure handler.
   * @param {?ErrorCallback<Element>} [onError] An optional error handler.
   * @returns {Promise<Set<Element>>} 
   */
  public async asyncRun(
    callbackFn: ProcessCallback<Element, void | Promise<void> | Processed>,
    onSuccess?: SuccessCallback<Element>,
    onFailure?: FailureCallback<Element>,
    onError?: ErrorCallback<Element>,
  ): Promise<Set<Element>> {
    const process = async () => {
      while (this.#tasks.processing.activeCount < this.#tasks.concurrency && super.length > 0) {
        const element = this.dequeue();
        if (element) {
          const task = this.#tasks
            .asyncProcess(element, callbackFn, onSuccess, onFailure, onError)
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
   * @param {ProcessCallback<Element, void | Promise<void> | Processed>} callbackFn A function to process each element in the queue.
   * @param {?SuccessCallback<Element>} [onSuccess] An optional function to handle the success.
   * @param {?FailureCallback<Element>} [onFailure] An optional function to handle the failure.
   * @param {?ErrorCallback<Element>} [onError] An optional function to handle the error.
   * @returns {void) => void}
   */
  public run(
    callbackFn: ProcessCallback<Element, void | Promise<void> | Processed>,
    onSuccess?: SuccessCallback<Element>,
    onFailure?: FailureCallback<Element>,
    onError?: ErrorCallback<Element>,
  ): void {
    while (super.length > 0) {
      this.#tasks.process(this.dequeue(), callbackFn, onSuccess, onFailure, onError);
    }
  }
}
