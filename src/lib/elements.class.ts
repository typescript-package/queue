// Abstract.
import { ArrayState } from "@typescript-package/state";
/**
 * @description Array state elements in data structures such as Stack and Queue.
 * @export
 * @class Elements
 * @template Type 
 * @extends {ArrayState<Type>}
 */
export class Elements<Type, Size extends number = number> extends ArrayState<Type>{
  /**
   * @description The maximum size of the `Elements`.
   * @public
   * @readonly
   * @type {Size}
   */
  public get size(): Size {
    return this.#size;
  }

  /**
   * @description Privately stored maximum elements size.
   * @type {Size}
   */
  #size: Size;

  /**
   * Creates an instance of `Elements`.
   * @constructor
   * @param {Type[]} elements 
   * @param {Size} [size=Infinity as Size] 
   */
  constructor(elements: Type[], size: Size = Infinity as Size) {
    super(elements.length <= size ? elements : []);
    // Sets the size.
    this.#size = size;
    // Throws an error if the elements exceeds the maximum size.
    if (elements.length > size) {
      throw new Error(`The \`elements\` size exceeds the maximum size ${size} by ${elements.length - size}.`);
    }
  }

  /**
   * @inheritdoc
   * @public
   * @param {Type} element The element of `Type` to append.
   * @returns {this} 
   */
  public override append(element: Type): this {
    this.#checkFull();
    super.append(element);
    return this;
  }

  /**
   * @inheritdoc
   * @public
   * @param {number} index The index under which the specified `element` is inserted.
   * @param {Type} element The element of `Type` to insert at specified `index`.
   * @returns {this} 
   */
  public override insert(index: number, element: Type): this {
    this.#checkFull();
    super.insert(index, element);
    return this;
  }

  /**
   * @description Checks whether the `Elements` state is full, equal to size.
   * @public
   * @returns {boolean} 
   */
  public isFull(): boolean {
    return this.#size === this.length;
  }

  /**
   * @description Add the element at the beginning of `array` state.
   * @public
   * @param {Type} element The element of `Type` to prepend.
   * @returns {this} 
   */
  public override prepend(element: Type): this {
    this.#checkFull();
    super.prepend(element);
    return this;
  }

  /**
   * @inheritdoc
   * @public
   * @param {number} index The index to update update element.
   * @param {Type} element The element of `Type` to update under the specified `index`.
   * @returns {this} 
   */
  public override update(index: number, element: Type): this {
    super.update(index, element);
    return this;
  }

  /** 
   * @description Checks whether length of the array is equal to maximum size.
   * @returns {this} 
   */
  #checkFull(): this {
    if (this.isFull()) {
      throw new Error(`Elements array state is full of size ${super.length}.`);
    }
    return this;
  }
};
