import { Elements } from "./elements.class";
import { Queue as AbstractQueue } from "./queue.abstract";
/**
 * @description A standard LIFO (Last In, First Out) queue.
 * @export
 * @abstract
 * @class Stack
 * @template Type
 */
export abstract class Stack<Type, Size extends number> {
  /**
   * @description The `Elements` of array state type.
   * @public
   * @readonly
   * @type {Elements<Type>}
   */
  public get elements(): Elements<Type> {
    return this.#stack.elements;
  }

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
   * @description The actual stack `Elements` state.
   * @public
   * @readonly
   * @type {readonly Type[]}
   */
  public get state(): readonly Type[] {
    return this.#stack.elements.state;
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
   * @param {...Type[]} elements
   */
  constructor(size: Size = Infinity as Size, ...elements: Type[]) {
    this.#size = size;
    this.#stack = new (class Stack<Type, Size extends number> extends AbstractQueue<Type, Size> {})(size, ...elements);
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
    return this.#stack.elements.last();
  }

  /**
   * @description Removes and returns the top element from the stack.
   * @public
   * @returns {(Type | undefined)} 
   */
  public pop(): Type | undefined {
    const last = this.peek();
    this.#stack.length > 0 && this.#stack.elements.remove(this.#stack.length - 1);
    return last;
  }

  /**
   * @description Adds a new element on the stack.
   * @public
   * @param {Type} element
   * @returns {this}
   */
  public push(element: Type): this {
    this.#stack.elements.append(element);
    return this;
  }
}
