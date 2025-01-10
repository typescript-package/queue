// Class.
import { Elements } from "./elements.class";
/**
 * @description A standard FIFO (First In, First Out) queue.
 * @export
 * @abstract
 * @class Queue
 * @template Type
 */
export abstract class Queue<Type, Size extends number = number> {
  /**
   * @description The `Elements` state holder.
   * @public
   * @readonly
   * @type {Elements<Type>}
   */
  public get elements(): Elements<Type> {
    return this.#elements;
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
   * @type {Size}
   */
  public get size(): Size {
    return this.#size;
  }

  /**
   * @description The actual queue `Elements` state - raw `array` state of the queue.
   * @public
   * @readonly
   * @type {readonly Type[]}
   */
  public get state(): readonly Type[] {
    return this.#elements.state;
  }

  /**
   * @description Privately stored maximum queue size of generic type variable `Size`.
   * @type {Size}
   */
  #size: Size;

  /**
   * @description Privately stored `Array` queue elements state of `Elements`.
   * @type {Elements<Type>}
   */
  #elements: Elements<Type>;

  /**
   * Creates an instance of child class.
   * @constructor
   * @param {Size} [size=Infinity as Size] The maximum size of the `Queue`.
   * @param {...Type[]} elements The arbitrary parameters of elements of  `Type` to add.
   */
  constructor(size: Size = Infinity as Size, ...elements: Type[]) {
    this.#size = size;
    this.#elements = new Elements(elements, size);
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
   * @param {Type} element The element of `Type` to add.
   * @returns {this}
   */
  public enqueue(element: Type): this {
    if (this.isFull()) {
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
    return this.#elements.isFull();
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
