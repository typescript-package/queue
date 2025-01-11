// Class.
import { Ability as Processable, Boolean as Active, Boolean as Debug } from "@typescript-package/state";
import { Processing } from "./processing.class";
// Type.
import { ErrorCallback, ProcessCallback } from "../type";
/**
 * @description
 * @export
 * @class Tasks
 * @template Type 
 * @extends {Processable}
 */
export class Tasks<Concurrency extends number> extends Processable {
  /**
   * @description
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
  // public get processed(): Set<Type> {
  //   return this.#processed;
  // }

  /**
   * @description
   * @public
   * @readonly
   * @type {Processing<Type, Concurrency>}
   */
  public get processing(): Processing {
    return this.#processing;
  }

  /**
   * @description
   * @type {*}
   */
  #active = new Active(false);

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
  #processed: Set<any> = new Set();

  /**
   * @description
   * @type {*}
   */
  #processing;

  #tasks: Set<Promise<void>> = new Set();

  /**
   * Creates an instance of `Tasks`.
   * @constructor
   * @param {Concurrency} concurrency 
   */
  constructor(enabled: boolean, concurrency: Concurrency) {
    super(enabled);
    this.#processing = new Processing();
    this.#concurrency = concurrency;
  }

  /**
   * @description Set the `Tasks` to debug state.
   * @public
   */
  public debug(): this {
    this.#debug.true();
    this.#processing.debug();
    return this;
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
  public async asyncProcess<Type>(
    element: Type,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>,
    onProcessed?: ProcessCallback<Type>
  ): Promise<void> {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`asyncProcess()\` method.`);
    }
    this.#consoleDebug("asyncProcess started", { element });
    // Create a task.
    const task = (async () => {
      try {
        this.#consoleDebug("Processing element:", element);
        await callbackFn(element);
      } catch (error) {
        this.#consoleDebug("Error occurred during processing:", { element, error });
        onError?.(element, error);
      } finally {
        onProcessed?.(element); // What to do with the processed
        this.#processed.add(element);
        this.#consoleDebug("Element processed:", { element, processed: this.#processed.size });
      }
    })();
    // Add the task to the processing state.
    await this.#processing.add(task);
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
  public async asyncRun<Type>(
    elements: Iterable<Type>,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>,
    onProcessed?: ProcessCallback<Type>,
    method: 'all' | 'default' | 'race' = 'default'
  ): Promise<Set<Type>> {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`asyncRun()\` method.`);
    }
    this.#consoleDebug("asyncRun started", { method, concurrency: this.#concurrency });
    switch(method) {
      case 'race':
        // this.#consoleDebug("Using 'race' method");
        for (const element of elements) {
          this.#consoleDebug("Processing element with 'race'", { element, activeCount: this.#processing.activeCount });
          this.#processing.activeCount >= this.#concurrency && await Promise.race([...this.#processing.state]);
          this.asyncProcess(element, callbackFn, onError, onProcessed);
        }
        break
      case 'all':
      default:
        this.#consoleDebug("Using the 'default' method");
        const iterator = elements[Symbol.iterator]();
        // Create the async process for the task.
        const process = async (): Promise<void> => {
          while (this.#processing.activeCount < this.#concurrency) {
            const { value: element, done } = iterator.next();
            if (done) break;
            this.#consoleDebug("Processing element with default", { element, concurrency: this.#concurrency, activeCount: this.#processing.activeCount });
            const task = this
              .asyncProcess(element, callbackFn, onError, onProcessed)
              .finally(() => (this.#tasks.delete(task), process()));
            this.#consoleDebug("Add the processed task to the tasks.", {element, task});
            this.#tasks.add(task);
          }
          // Wait for the tasks to finish.
          await Promise.all(this.#tasks);
        };
        await process();
        break;
    }
    this.#consoleDebug("asyncRun completed");
    await this.#processing.complete();
    return this.#processed;
  }

  /**
   * @description Runs a synchronous processing on the provided `element` using the `callbackFn`.
   * If an `onError` callback is provided, it will handle any errors encountered during processing.
   * @param {(Type | undefined)} element The element to be processed.
   * @param {ProcessCallback<Type>} callbackFn A function that processes the element synchronously.
   * @param {?ErrorCallback<Type>} [onError] An optional callback function to handle errors during processing.
   * @returns {this} The current instance for method chaining.
   */
  public process<Type>(
    element: Type | undefined,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>,
    onProcessed?: ProcessCallback<Type>
  ): this {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`process()\` method.`);
    }
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
        onProcessed?.(element);
        // Add to the processed.
        this.#processed.add(element);
        this.#consoleDebug("Element processed", { element, processedCount: this.#processed.size });
        this.#active.false();
        this.#consoleDebug("Processing state deactivated", { active: this.#active.state });
      }  
    }
    return this;
  }

  /**
   * @description Runs the provided `callbackFn` synchronously on each element in the `elements` iterable.
   * If an `onError` callback is provided, it will handle errors encountered during processing.
   * @public
   * @param {Iterable<Type>} elements An iterable collection of elements to be processed.
   * @param {ProcessCallback<Type>} callbackFn A function that will process each element synchronously.
   * @param {?ErrorCallback<Type>} [onError] Optional callback for handling errors that occur during processing.
   */
  public run<Type>(
    elements: Iterable<Type>,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>,
    onProcessed?: ProcessCallback<Type>
  ) {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`run()\` method.`);
    }
    this.#consoleDebug("run started", { elements });
    for (const element of elements) {
      this.#consoleDebug("Processing element synchronously", { element });
      this.process(element, callbackFn, onError, onProcessed);
    }
    this.#consoleDebug("run completed");
  }

  /**
   * @description Unset the `Tasks` from debug state.
   * @public
   */
  public unDebug(): this {
    this.#debug.false();
    this.#processing.unDebug();
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
