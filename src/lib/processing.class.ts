// Class.
import { Boolean as Active, Boolean as Debug, State } from "@typescript-package/state";
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
   * @description
   * @type {Debug}
   */
  #debug = new Debug(false);

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
   * @description Set the `Processing` to debug state.
   * @public
   */
  public debug(): this {
    this.#debug.true();
    return this;
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
    this.#consoleDebug("asyncRun started", { method, concurrency: this.#concurrency });
    switch(method) {
      case 'race':
        this.#consoleDebug("Using 'race' method");
        for (const element of elements) {
          this.#consoleDebug("Processing element with 'race'", { element, activeCount: this.#activeCount });
          this.#activeCount >= this.#concurrency && await Promise.race(super.state);
          this.asyncProcess(element, callbackFn, onError);
        }
        break
      default:
        this.#consoleDebug("Using 'default' method");
        const iterator = elements[Symbol.iterator]();
        const process = async (): Promise<void> => {          
          while (this.#activeCount < this.#concurrency) {
            const { value: element, done } = iterator.next();
            if (done) break;
            this.#consoleDebug("Processing element", { element, activeCount: this.#activeCount });
            this.asyncProcess(element, callbackFn, onError).finally(() => process());
          }
        };
        await process();
        break;
    }
    this.#consoleDebug("asyncRun completed");
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
    this.#consoleDebug("run started", { elements });
    for (const element of elements) {
      this.#consoleDebug("Processing element synchronously", { element });
      this.process(element, callbackFn, onError);
    }
    this.#consoleDebug("run completed");
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
    this.#consoleDebug("asyncProcess started", { element, activeCount: this.#activeCount });

    // Activate the processing state.
    this.#active.isFalse() && this.#active.true();
    this.#consoleDebug("Processing state activated", { active: this.#active.state });

    // Increase the active count.
    this.#activeCount++;
    this.#consoleDebug("Incremented activeCount", { activeCount: this.#activeCount });

    // Create a task.
    const task = (async () => {
      try {
        this.#consoleDebug("Processing element:", element);
        await callbackFn(element);
      } catch (error) {
        this.#consoleDebug("Error occurred during processing:", { element, error });
        onError?.(element, error);
      } finally {
        this.#processed.add(element);
        this.#consoleDebug("Element processed:", { element, processed: this.#processed.size });
      }
    })();

    // Add the task to the processing state.
    super.state.add(task);
    this.#consoleDebug("Task added to processing state", { taskCount: super.state.size });

    try {
      await task;
    } finally {
      // Remove the task from the processing state.
      super.state.delete(task);
      this.#consoleDebug("Task removed from processing state", { taskCount: super.state.size });

      // Decrease the active count.
      this.#activeCount--;
      this.#consoleDebug("Decremented activeCount", { activeCount: this.#activeCount });

      // If active count is equal to `0` then deactivate the active processing state.
      this.#activeCount === 0 && (this.#active.false(), this.#consoleDebug("Processing state deactivated", { active: this.#active.state }));
    }
  }

  /**
   * @description Checks whether the `Processing` is active.
   * @public
   * @param {?boolean} [expected] An optional `boolean` type value to check the active state.
   * @returns {boolean} 
   */
  public isActive(expected?: boolean): boolean {
    return typeof expected === 'boolean' ? this.#active.isTrue() === expected : this.#active.isTrue();
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
    this.#consoleDebug("process started", { element });
    this.#active.isFalse() && this.#active.true();
    this.#consoleDebug("Processing state activated", { active: this.#active.state });
    if (element) {
      try {
        this.#consoleDebug("Processing element", { element });
        callbackFn(element);
      } catch(error) {
        this.#consoleDebug("Error during processing", { error, element });
        onError?.(element, error);
      } finally {
        this.#processed.add(element);
        this.#consoleDebug("Element processed", { element, processedCount: this.#processed.size });
        this.#active.false();
        this.#consoleDebug("Processing state deactivated", { active: this.#active.state });
      }  
    }
    return this;
  }

  /**
   * @description Unset the `Processing` from debug state.
   * @public
   */
  public unDebug(): this {
    this.#debug.false();
    return this;
  }

  /**
   * @description
   * @param {string} message 
   * @param {?*} [data] 
   * @returns {this} 
   */
  #consoleDebug(message: string, data?: any): this {
    this.#debug.isTrue() && console.debug(message, data || '');
    return this;
  }
}
