// Class.
import { Boolean as Debug, State } from "@typescript-package/state";
/**
 * @description Class designed for asynchronous with concurrency control and synchronous processing the elements of `Type`.
 * @export
 * @class Processing
 * @extends {State<Set<Promise<void>>>} The state for active processing tasks, tracking the status of asynchronous operations.
 */
export class Processing extends State<Set<Promise<void>>> {
  /**
   * @description Tracks whether the queue is processing elements.
   * @public
   * @readonly
   * @type {boolean}
   */
  public get active(): boolean {
    return super.state.size > 0;
  }

  /**
   * @description A current number of elements being processed.
   * @public
   * @readonly
   * @type {number}
   */
  public get activeCount(): number {
    return super.state.size;
  }

  /**
   * @description Returns the first task from processing.
   * @public
   * @readonly
   * @type {Promise<void>}
   */
  public get first(): Promise<void> {
    return Array.from(super.state)[0];
  }

  /**
   * @description Returns the last task from processing.
   * @public
   * @readonly
   * @type {Promise<void>}
   */
  public get last(): Promise<void> {
    return Array.from(super.state)[super.state.size - 1];
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
   * @description Set the `Processing` to debug state.
   * @public
   */
  public debug(): this {
    this.#debug.true();
    return this;
  }

  /**
   * @description
   * @public
   * @param {Promise<void>} task 
   * @returns {this} 
   */
  public async add(task: Promise<void>): Promise<void> {
    this.#consoleDebug("Task added to processing state", { active: this.active, activeCount: this.activeCount });
    await super.state.add(task);
    task.finally(() => {
      this.#consoleDebug("activeCount state before removing the task", { activeCount: this.activeCount })
      super.state.delete(task);
      this.#consoleDebug("Task removed from processing state", { activeCount: this.activeCount })
    });
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
   * @description Checks whether the `Processing` is active.
   * @public
   * @param {?boolean} [expected] An optional `boolean` type value to check the active state.
   * @returns {boolean} 
   */
  public isActive(expected?: boolean): boolean {
    return typeof expected === 'boolean' ? this.active === expected : this.active;
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
