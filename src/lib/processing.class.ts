// Class.
import { Boolean as Active } from "@typescript-package/state";
export type ProcessCallback<Type> = (element: Type) => void | Promise<void>;
export type ErrorCallback<Type> = (element: Type, error: unknown) => void;
/**
 * @description
 * @export
 * @class Processing
 * @template Type 
 */
export class Processing<Type, Concurrency extends number = number> {
  /**
   * @description Whether processing is active.
   * @public
   * @readonly
   * @type {boolean}
   */
  public get active(): boolean {
    return this.#active.state;
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
   * @description
   * @type {Active}
   */
  #active = new Active(false);

  /**
   * @description
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
   */
  #processed: Set<Type> = new Set();

  /**
   * @description
   * @readonly
   * @type {*}
   */
  readonly #processing = new Set<Promise<void>>();

  /**
   * Creates a `Processing` object.
   * @param {Concurrency} concurrency The maximum number of concurrent processes.
   */
  constructor(concurrency: Concurrency) {
    this.#concurrency = concurrency;
  }

  /**
   * @description Starts processing elements.
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
    this.#active.true();
    const processing = new Set<Promise<void>>();
    switch(method) {
      case 'race':
        for (const element of elements) {
          this.#activeCount >= this.#concurrency && await Promise.race(this.#processing);
          const task = this.#asyncProcess(element, callbackFn, onError).finally(() => this.#processing.delete(task));
          this.#processing.add(task);
        }
        break
      default:
        const iterator = elements[Symbol.iterator]();
        const process = async (): Promise<void> => {
          while (this.#activeCount < this.#concurrency) {
            const { value: element, done } = iterator.next();
            if (done) break;
            const task = this.#asyncProcess(element, callbackFn, onError).finally(() => (process(), processing.delete(task)));
            processing.add(task);
          }
        };
        await process();
        break;
    }
    await this.complete();
    this.#active.false();
  }

  /**
   * @description Returns `Promise` that waits for the processing completion.
   * @public
   * @async
   * @returns {Promise<void>} 
   */
  public async complete(): Promise<void> {
    await Promise.all(this.#processing);
  }

  /**
   * @description 
   * @public
   * @param {Iterable<Type>} elements 
   * @param {ProcessCallback<Type>} callbackFn 
   * @param {?ErrorCallback<Type>} [onError] 
   */
  public run(
    elements: Iterable<Type>,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>
  ) {
    this.#active.true();
    for (const element of elements) {
      this.#process(element, callbackFn, onError);
    }
    this.#active.false();
  }

  /**
   * @description Runs asynchronous single processing task.
   * @private
   * @param {Type} element The element to process.
   * @param {ProcessCallback<Type>} callbackFn The function to process the element.
   * @param {ErrorCallback<Type>} [onError] An optional error handler.
   * @returns {Promise<void>}
   */
  async #asyncProcess(
    element: Type,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>
  ): Promise<void> {
    this.#activeCount++;
    try {
      await callbackFn(element);
    } catch (error) {
      onError?.(element, error);
    } finally {
      this.#activeCount--;
      this.#processed.add(element);
    }
  }

  /**
   * @description Runs synchronous single processing task.
   * @param {(Type | undefined)} element 
   * @param {ProcessCallback<Type>} callbackFn 
   * @param {?ErrorCallback<Type>} [onError] 
   * @returns {this} 
   */
  #process(
    element: Type | undefined,
    callbackFn: ProcessCallback<Type>,
    onError?: ErrorCallback<Type>
  ): this {
    if (element) {
      try {
        callbackFn(element);
      } catch(error) {
        onError?.(element, error);
      } finally {
        this.#processed.add(element);
      }  
    }
    return this;
  }
}
