// Class.
import { Elements } from "./elements.class";
/**
 * @description A standard FIFO (First In, First Out) queue.
 * @export
 * @abstract
 * @class Queue
 * @template Type
 */
export abstract class Queue<Type> {
  /**
   * @description
   * @public
   * @readonly
   * @type {readonly Type[]}
   */
  public get elements(): readonly Type[] {
    return this.#elements.state;
  }

  /**
   * @description The actual queue length.
   * @public
   * @readonly
   * @type {number}
   */
  public get length(): number {
    return this.#elements.length;
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
   * @type {Elements<Type>}
   */
  public get state() {
    return this.#elements;
  }

  /**
   * @description Privately stored maximum queue size.
   * @type {number}
   */
  #size;

  /**
   * @description Privately stored `Array` queue elements state.
   * @type {Elements<Type>}
   */
  #elements;

  /**
   * Creates an instance of `Queue`.
   * @constructor
   * @param {number} [size=Infinity]
   * @param {...Type[]} elements
   */
  constructor(size: number = Infinity, ...elements: Type[]) {
    this.#size = size;
    this.#elements = new Elements(elements);
  }

  /**
   * @description Clears the queue.
   * @public
   * @returns {this}
   */
  public clear(): this {
    this.#elements.clear();
    return this;
  }

  /**
   * @description Removes and returns the first (front) element from the queue.
   * @public
   * @returns {(Type | undefined)}
   */
  public dequeue(): Type | undefined {
    const first = this.#elements.first();
    this.#elements.remove(0);
    return first;
  }

  /**
   * @description Adds a new element to the queue.
   * @public
   * @param {Type} element
   * @returns {this}
   */
  public enqueue(element: Type): this {
    if (this.length === this.size) {
      throw new Error(`Queue is full.`);
    }
    this.#elements.append(element);
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
    return this.#elements.first();
  }
}
