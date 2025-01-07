// Class.
import { Boolean as Active, State } from "@typescript-package/state";
// Type.
import { ErrorCallback, ProcessCallback } from "../type";
/**
 * @description Class designed for asynchronous with concurrency control and synchronous processing the elements of `Type`.
 * @export
 * @class Processing
 * @template Type 
 * @template {number} [Concurrency=number] - The type for concurrency, defaults to `number`.
 * @extends {State<Set<Promise<void>>>} The state for active processing tasks, tracking the status of asynchronous operations.
 */
export class Processing<Type, Concurrency extends number = number> extends State<Set<Promise<void>>> {
  /**
   * @description Tracks whether the queue is processing elements.
   * @public
   * @readonly
   * @type {boolean}
   */
  public get active(): boolean {
    return this.#active.state;
  }

  /**
   * @description A current number of elements being processed.
   * @public
   * @readonly
   * @type {number}
   */
  public get activeCount(): number {
    return this.#activeCount;
  }

  /**
   * @description The maximum number of elements that can be processed concurrently.
   * @public
   * @readonly
   * @type {Concurrency}
   */
  public get concurrency(): Concurrency {
    return this.#concurrency;
  }

  /**
   * @description The set of processed elements.
   * @public
   * @readonly
   * @type {Set<Type>}
   */
  public get processed(): Set<Type> {
    return this.#processed;
  }

  /**
   * @description Tracks whether the queue is processing elements.
   * @type {Active}
   */
  #active = new Active(false);

  /**
   * @description Privately stored current number of elements being processed.
   * @type {number}
   */
  #activeCount = 0;

  /**
   * @description
   * @type {Concurrency}
   */
  #concurrency: Concurrency;
  
  /**
   * @description A set of processed elements.
   * @type {Set<Type>}
   */
  #processed: Set<Type> = new Set();

  /**
   * Creates a `Processing` object.
   * @param {Concurrency} concurrency The maximum number of concurrent processes.
   */
  constructor(concurrency: Concurrency) {
    super(new Set())
    this.#concurrency = concurrency;
  }

  /**
   * @description Starts asynchronous processing elements with concurrency control.
   * @public
   * @async
   * @param {Iterable<Type>} elements The elements to process.
   * @param {ProcessCallback<Type>} callbackFn The function to process each element.
   * @param {?ErrorCallback<Type>} [onError] An optional error handler.
   * @param {('default' | 'race')} [method='default'] 
   * @returns {Promise<void>} 
   */
  public async asyncRun(
    elements: Iterable<Type>,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>,
    method: 'default' | 'race' = 'default'
  ): Promise<void> {
    switch(method) {
      case 'race':
        for (const element of elements) {
          this.#activeCount >= this.#concurrency && await Promise.race(super.state);
          this.asyncProcess(element, callbackFn, onError);
        }
        break
      default:
        const iterator = elements[Symbol.iterator]();
        const process = async (): Promise<void> => {
          while (this.#activeCount < this.#concurrency) {
            const { value: element, done } = iterator.next();
            if (done) break;
            this.asyncProcess(element, callbackFn, onError).finally(() => process());
          }
        };
        await process();
        break;
    }
    await this.complete();
  }

  /**
   * @description Returns `Promise` that waits for the processing completion.
   * @public
   * @async
   * @returns {Promise<void>} 
   */
  public async complete(): Promise<void> {
    await Promise.all(super.state);
  }

  /**
   * @description Runs the provided `callbackFn` synchronously on each element in the `elements` iterable.
   * If an `onError` callback is provided, it will handle errors encountered during processing.
   * @public
   * @param {Iterable<Type>} elements An iterable collection of elements to be processed.
   * @param {ProcessCallback<Type>} callbackFn A function that will process each element synchronously.
   * @param {?ErrorCallback<Type>} [onError] Optional callback for handling errors that occur during processing.
   */
  public run(
    elements: Iterable<Type>,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>
  ) {
    for (const element of elements) {
      this.process(element, callbackFn, onError);
    }
  }

  /**
   * @description Runs asynchronous single processing task on the `element`.
   * @public
   * @async
   * @param {Type} element The element to process.
   * @param {ProcessCallback<Type>} callbackFn The callback function to process the element.
   * @param {ErrorCallback<Type>} [onError] An optional error handler.
   * @returns {Promise<void>}
   */
  public async asyncProcess(
    element: Type,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>
  ): Promise<void> {
    // Activate the processing state.
    this.#active.isFalse() && this.#active.true();
    // Increase the active count.
    this.#activeCount++;

    // Create a task.
    const task = (async () => {
      try {
        await callbackFn(element);
      } catch (error) {
        onError?.(element, error);
      } finally {
        this.#processed.add(element);
      }
    })();

    // Add the task to the processing state.
    super.state.add(task);

    try {
      await task;
    } finally {
      // Remove the task from the processing state.
      super.state.delete(task);
      // Decrease the active count.
      this.#activeCount--;
      // If active count is equal to `0` then deactivate the active processing state.
      this.#activeCount === 0 && this.#active.false();
    }
  }

  /**
   * @description Runs a synchronous processing on the provided `element` using the `callbackFn`.
   * If an `onError` callback is provided, it will handle any errors encountered during processing.
   * @param {(Type | undefined)} element The element to be processed.
   * @param {ProcessCallback<Type>} callbackFn A function that processes the element synchronously.
   * @param {?ErrorCallback<Type>} [onError] An optional callback function to handle errors during processing.
   * @returns {this} The current instance for method chaining.
   */
  public process(
    element: Type | undefined,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>
  ): this {
    this.#active.isFalse() && this.#active.true();
    if (element) {
      try {
        callbackFn(element);
      } catch(error) {
        onError?.(element, error);
      } finally {
        this.#processed.add(element);
        this.#active.false();
      }  
    }
    return this;
  }
}
