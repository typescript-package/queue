// Class.
import { Ability as Processable, Boolean as Active, Boolean as Debug } from "@typescript-package/state";
import { Processing } from "./processing.class";
// Type.
import { ErrorCallback, FailureCallback, ProcessCallback, SuccessCallback } from '@typedly/callback';
// Enum.
import { Processed } from "../enum/processed.enum";
/**
 * @description A class designed to manage and execute a collection of asynchronous tasks with concurrently control or synchronous tasks.
 * @export
 * @class Tasks
 * @template Element 
 * @extends {Processable}
 */
export class Tasks<Element = any, Concurrency extends number = number> extends Processable {
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
   * @description Returns the processed elements.
   * @public
   * @readonly
   * @type {Set<Element>}
   */
  public get processed(): Set<Element> {
    return this.#processed;
  }

  /**
   * @description Returns the `Processing` object that contains active tasks.
   * @public
   * @readonly
   * @type {Processing<Element, Concurrency>}
   */
  public get processing(): Processing {
    return this.#processing;
  }

  /**
   * @description Console debug the important steps of the `Tasks` functionality on debug state `true`.
   * @readonly
   * @type {Console | undefined}
   */
  get #console() {
    return this.#debug.isTrue() ? console : undefined;
  }

  /**
   * @description Active state for synchronous processing.
   * @type {Active}
   */
  #active = new Active(false);

  /**
   * @description Privately stored maximum number of elements that can be processed concurrently.
   * @type {Concurrency}
   */
  #concurrency: Concurrency;

  /**
   * @description Privately stored debug state.
   * @type {Debug}
   */
  #debug = new Debug(false);

  /**
   * @description A set of processed elements.
   * @type {Set<Element>}
   */
  #processed: Set<Element> = new Set();

  /**
   * @description Privately stored `Processing` object that contains active tasks.
   * @type {Processing}
   */
  #processing;

  /**
   * Creates an instance of `Tasks`.
   * @constructor
   * @param {Concurrency} concurrency 
   */
  
  /**
   * Creates an instance of `Tasks`.
   * @constructor
   * @param {boolean} enabled Enable initially `Tasks` functionality.
   * @param {Concurrency} concurrency The maximum number of elements that can be processed concurrently.
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
   * @description Runs asynchronous single processing on the `element`.
   * @public
   * @async
   * @param {Element} element The element to process.
   * @param {ProcessCallback<Element, void | Promise<void> | Processed>} callbackFn The callback function to process the element.
   * @param {SuccessCallback<Element>} [onSuccess] An optional success handler.
   * @param {FailureCallback<Element>} [onFailure] An optional failure handler.
   * @param {ErrorCallback<Element>} [onError] An optional error handler.
   * @returns {Promise<void>}
   */
  public async asyncProcess(
    element: Element,
    callbackFn: ProcessCallback<Element, void | Promise<void> | Processed>,
    onSuccess?: SuccessCallback<Element>,
    onFailure?: FailureCallback<Element>,
    onError?: ErrorCallback<Element>,
  ): Promise<void> {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`asyncProcess()\` method.`);
    }
    this.#console?.debug("asyncProcess started", { element });
    // Create a promise.
    const task = (async () => {
      let processed: void | Promise<void> | Processed = Processed.Success;

      try {
        this.#console?.debug("Processing element:", element);
        processed = await callbackFn(element);
      } catch (error) {
        this.#console?.debug("Error occurred during processing:", { element, error });
        onError?.(element);
      } finally {
        (processed === Processed.Failure) ? onFailure?.(element) : onSuccess?.(element);
        this.#processed.add(element);
        this.#console?.debug("Element processed:", { element, processed: this.#processed.size });
      }
    })();
    // Add the task to the processing state.
    await this.#processing.add(task);
  }

  /**
   * @description Starts asynchronous processing elements with concurrency control.
   * @public
   * @async
   * @param {Iterable<Element>} elements The elements to process.
   * @param {ProcessCallback<Element, void | Promise<void> | Processed>} processFn The function to process each element.
   * @param {?SuccessCallback<Element>} [onSuccess] An optional on success handler.
   * @param {?FailureCallback<Element>} [onFailure] An optional on failure handler.
   * @param {?ErrorCallback<Element>} [onError] An optional on error handler.
   * @param {('default' | 'race')} [method='default'] 
   * @returns {Promise<void>} 
   */
  public async asyncRun(
    elements: Iterable<Element>,
    processFn: ProcessCallback<Element, void | Promise<void> | Processed>,
    onSuccess?: SuccessCallback<Element>,
    onFailure?: FailureCallback<Element>,
    onError?: ErrorCallback<Element>,
    method: 'all' | 'default' | 'race' = 'default'
  ): Promise<Set<Element>> {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`asyncRun()\` method.`);
    }
    this.#console?.debug("asyncRun started", { method, concurrency: this.#concurrency });
    switch(method) {
      case 'race':
        this.#console?.debug("Using 'race' method");
        for (const element of elements) {
          this.#console?.debug("Processing element with 'race'", { element, activeCount: this.#processing.activeCount });
          this.#processing.activeCount >= this.#concurrency && await Promise.race(this.#processing.state);
          this.asyncProcess(element, processFn, onSuccess, onFailure, onError);
        }
        break
      case 'all':
      default:
        this.#console?.debug("Using the 'default' / 'all' method");
        const iterator = elements[Symbol.iterator]();
        // Create the async process for the task.
        const process = async (): Promise<void> => {
          while (this.#processing.activeCount < this.#concurrency) {
            const { value: element, done } = iterator.next();
            if (done) break;
            this.#console?.debug("Processing element with default", { element, concurrency: this.#concurrency, activeCount: this.#processing.activeCount });
            const task = this
              .asyncProcess(element, processFn, onSuccess, onFailure, onError)
              .finally(() => (this.#processing.delete(task), process()));
            this.#console?.debug("Add the processed task to the processing.", {element, task});
            this.#processing.add(task, false);
          }
          // Wait for the tasks to finish.
          await Promise.all(this.#processing.state)
        };
        await process();
        break;
    }
    this.#console?.debug("asyncRun completed");
    await this.#processing.complete();
    return this.#processed;
  }

  /**
   * @description Runs a synchronous processing on the provided `element` using the `callbackFn`.
   * If an `onError` callback is provided, it will handle any errors encountered during processing.
   * @public
   * @param {(Element | undefined)} element The element to be processed.
   * @param {ProcessCallback<Element, void | Promise<void> | Processed>} callbackFn A function that processes the element synchronously.
   * @param {?SuccessCallback<Element>} [onSuccess] An optional callback function to handle success element being processed.
   * @param {?FailureCallback<Element>} [onFailure] An optional callback function to handle failure element being processed.
   * @param {?ErrorCallback<Element>} [onError] An optional callback function to handle errors during processing.
   * @returns {this} The current instance for method chaining.
   */
  public process(
    element: Element | undefined,
    callbackFn: ProcessCallback<Element, void | Promise<void> | void | Promise<void> | Processed>,
    onSuccess?: SuccessCallback<Element>,
    onFailure?: FailureCallback<Element>,
    onError?: ErrorCallback<Element>,
  ): this {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`process()\` method.`);
    }
    this.#console?.debug("process started", { element });
    this.#active.isFalse() && this.#active.true();
    this.#console?.debug("Processing state activated", { active: this.#active.state });
    if (element) {
      let processed: void | Promise<void> | Processed = Processed.Success;
      try {
        this.#console?.debug("Processing element", { element });
        processed = callbackFn(element);
      } catch(error) {
        this.#console?.debug("Error during processing", { error, element });
        onError?.(element);
      } finally {
        (processed === Processed.Failure) ? onFailure?.(element) : onSuccess?.(element);
        // Add to the processed.
        this.#processed.add(element);
        this.#console?.debug("Element processed", { element, processedCount: this.#processed.size });
        this.#active.false();
        this.#console?.debug("Processing state deactivated", { active: this.#active.state });
      }  
    }
    return this;
  }

  /**
   * @description Runs the provided `callbackFn` synchronously on each element in the `elements` iterable.
   * If an `onError` callback is provided, it will handle errors encountered during processing.
   * @public
   * @param {Iterable<Element>} elements An iterable collection of elements to be processed.
   * @param {ProcessCallback<Element, void | Promise<void> | Processed>} processFn A function that will process each element synchronously.
   * @param {?SuccessCallback<Element>} [onSuccess] Optional callback for success processed element.
   * @param {?FailureCallback<Element>} [onFailure] Optional callback for failure of processed element.
   * @param {?ErrorCallback<Element>} [onError] Optional callback for handling errors that occur during processing.
   */
  public run(
    elements: Iterable<Element>,
    processFn: ProcessCallback<Element, void | Promise<void> | Processed>,
    onSuccess?: SuccessCallback<Element>,
    onFailure?: FailureCallback<Element>,
    onError?: ErrorCallback<Element>,
  ) {
    if (this.isDisabled()) {
      throw new Error(`Enable the functionality to use the \`run()\` method.`);
    }
    this.#console?.debug("run started", { elements });
    for (const element of elements) {
      this.#console?.debug("Processing element synchronously", { element });
      this.process(element, processFn, onSuccess, onFailure, onError);
    }
    this.#console?.debug("run completed");
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
}
