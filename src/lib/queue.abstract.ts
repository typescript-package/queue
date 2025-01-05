import { ArrayState as AbstractArrayState } from "@typescript-package/state";
/**
 * @description A standard FIFO (First In, First Out) queue.
 * @export
 * @abstract
 * @class Queue
 * @template Type
 */
export abstract class Queue<Type> {
  /**
   * @description The actual queue length.
   * @public
   * @readonly
   * @type {number}
   */
  public get length(): number {
    return this.#queue.length;
  }

  /**
   * @description The maximum queue size.
   * @public
   * @readonly
   * @type {number}
   */
  public get size(): number {
    return this.#size;
  }

  /**
   * @description The `Array` queue state.
   * @public
   * @readonly
   * @type {ArrayState<Type>}
   */
  public get queue() {
    return this.#queue;
  }

  /**
   * @description Privately stored maximum queue size.
   * @type {number}
   */
  #size;

  /**
   * @description Privately stored `Array` queue state.
   * @type {ArrayState<Type>}
   */
  #queue;

  /**
   * Creates an instance of `Queue`.
   * @constructor
   * @param {number} [size=Infinity]
   * @param {...Type[]} items
   */
  constructor(size: number = Infinity, ...items: Type[]) {
    this.#size = size;
    this.#queue = new (class ArrayState<Type> extends AbstractArrayState<Type>{})(items);
  }

  /**
   * @description Clears the queue.
   * @public
   * @returns {this}
   */
  public clear(): this {
    this.#queue.clear();
    return this;
  }

  /**
   * @description Removes and returns the first (front) element from the queue.
   * @public
   * @returns {(Type | undefined)}
   */
  public dequeue(): Type | undefined {
    const first = this.#queue.first();
    this.#queue.remove(0);
    return first;
  }

  /**
   * @description Adds a new element to the queue.
   * @public
   * @param {Type} item
   * @returns {this}
   */
  public enqueue(item: Type): this {
    if (this.length === this.size) {
      throw new Error(`Queue is full.`);
    }
    this.#queue.append(item);
    return this;
  }

  /**
   * @description Checks if the queue is empty.
   * @public
   * @returns {boolean}
   */
  public isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * @description Checks if the queue is full.
   * @public
   * @returns {boolean}
   */
  public isFull(): boolean {
    return this.length === this.#size;
  }

  /**
   * @description Returns the first element in the queue.
   * @public
   * @returns {Type}
   */
  public peek(): Type {
    return this.#queue.first();
  }
}
