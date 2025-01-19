// Class.
import { Boolean as Debug, State } from "@typescript-package/state";
/**
 * @description Class designed for asynchronous processing the promises of `void`.
 * @export
 * @class Processing
 * @extends {State<Set<Promise<void>>>} The state for active processing promises, tracking the status of asynchronous operations.
 */
export class Processing extends State<Set<Promise<void>>> {
  /**
   * @description Tracks whether there are actively processed promises.
   * @public
   * @readonly
   * @type {boolean}
   */
  public get active(): boolean {
    return super.state.size > 0;
  }

  /**
   * @description A current number of promises being processed.
   * @public
   * @readonly
   * @type {number}
   */
  public get activeCount(): number {
    return super.state.size;
  }

  /**
   * @description Returns the first promise from processing.
   * @public
   * @readonly
   * @type {Promise<void>}
   */
  public get first(): Promise<void> {
    return Array.from(super.state)[0];
  }

  /**
   * @description Returns the last promise from processing.
   * @public
   * @readonly
   * @type {Promise<void>}
   */
  public get last(): Promise<void> {
    return Array.from(super.state)[super.state.size - 1];
  }

  /**
   * @description Display the console debug on debug state `true`.
   * @readonly
   * @type {*}
   */
  get #console() {
    return this.#debug.isTrue() ? console : undefined;
  }

  /**
   * @description
   * @type {*}
   */
  #debug = new Debug(false);

  /**
   * Creates a `Processing` object.
   * @constructor
   */
  constructor() {
    super(new Set());
  }

  /**
   * @description Adds the promise to the processing state.
   * @public
   * @param {Promise<void>} promise The promise of `void` to add.
   * @returns {this} 
   */
  public add(promise: Promise<void>, remove: boolean = true): this {
    super.state.add(promise);
    this.#console?.debug("`Promise` added to processing state", { active: this.active, activeCount: this.activeCount });
    remove === true && promise.finally(() => this.delete(promise));
    return this;
  }

  /**
   * @description Returns `Promise` that waits for the processing completion.
   * @public
   * @async
   * @returns {Promise<void>} 
   */
  public async complete(): Promise<void> {
    this.#console?.debug("Invoked `Processing.complete()` to wait for all processes from the state ", { activeCount: this.activeCount })
    const promise = Promise.all(super.state);
    await promise;
    if (this.#debug.isTrue()) {
      promise.finally(() => 
        this.#console?.debug("`Processing.complete()` finally method invoked.", { activeCount: this.activeCount })
      );
    }
  }

  /**
   * @description Sets the `Processing` to debug state.
   * @public
   */
  public debug(): this {
    this.#debug.true();
    return this;
  }

  /**
   * @description Removes the specified promise from the processing state.
   * @public
   * @param {Promise<void>} promise 
   * @returns {this} 
   */
  public delete(promise: Promise<void> = this.first): this {
    this.#console?.debug("`activeCount` state before removing the `Promise`", { activeCount: this.activeCount })
    super.state.delete(promise);
    this.#console?.debug("`Promise` removed from processing state", { activeCount: this.activeCount });
    return this;
  }

  /**
   * @description Checks whether the `Processing` is active.
   * @public
   * @param {?boolean} [expected] An optional `boolean` type value to check the active state.
   * @returns {boolean} 
   */
  public isActive(expected?: boolean): boolean {
    return typeof expected === 'boolean' ? this.active === expected : this.active;
  }

  /**
   * @description Unset the `Processing` from the debug state.
   * @public
   */
  public unDebug(): this {
    this.#debug.false();
    return this;
  }
}
