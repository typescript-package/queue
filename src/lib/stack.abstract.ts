import { Queue as AbstractQueue } from "./queue.abstract";
/**
 * @description A standard LIFO (Last In, First Out) queue.
 * @export
 * @abstract
 * @class Stack
 * @template Type
 */
export abstract class Stack<Type> {
  /**
   * @description The actual stack length.
   * @public
   * @readonly
   * @type {number}
   */
  public get length() {
    return this.#stack.length;
  }

  /**
   * @description The maximum stack size.
   * @public
   * @readonly
   * @type {number}
   */
  public get size(): number {
    return this.#size;
  }

  /**
   * @description The `Array` stack state.
   * @public
   * @readonly
   * @type {ArrayState<Type>}
   */
  public get stack() {
    return this.#stack.queue;
  }

  /**
   * @description Privately stored maximum stack size.
   * @type {number}
   */
  #size;

  /**
   * @description Privately stored `Array` stack state.
   * @type {ArrayState<Type>}
   */
  #stack;

  /**
   * Creates an instance of `Stack`.
   * @constructor
   * @param {number} [size=Infinity]
   * @param {...Type[]} items
   */
  constructor(size: number = Infinity, ...items: Type[]) {
    this.#size = size;
    this.#stack = new (class Stack<Type> extends AbstractQueue<Type> {})(size, ...items);
  }

  /**
   * @description Clears the queue.
   * @public
   * @returns {this}
   */
  public clear(): this {
    this.#stack.clear();
    return this;
  }

  /**
   * @description Returns the top element on the stack.
   * @public
   * @returns {(Type | undefined)}
   */
  public peek(): Type | undefined {
    return this.stack.last();
  }

  /**
   * @description Removes and returns the top element from the stack.
   * @public
   * @returns {Type}
   */
  public pop(): Type {
    const last = this.stack.last();
    this.#stack.length > 0 && this.stack.remove(this.#stack.length - 1);
    return last;
  }

  /**
   * @description Adds a new element on the stack.
   * @public
   * @param {Type} item
   * @returns {this}
   */
  public push(item: Type): this {
    this.stack.append(item);
    return this;
  }
}
