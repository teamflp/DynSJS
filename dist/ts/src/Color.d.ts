/**
 * Represents an immutable color with RGBA & HSLA values.
 * @class Color
 * @property {number} r - Red channel value (0-255)
 * @property {number} g - Green channel value (0-255)
 * @property {number} b - Blue channel value (0-255)
 * @property {number} a - Alpha channel value (0-1)
 */
export class Color {
    static fromHex(hex: any): Color;
    static fromRgb(rgb: any): Color;
    static fromRgba(rgba: any): Color;
    static fromHsl(h: any, s: any, l: any, a?: number): Color;
    constructor(r: any, g: any, b: any, a?: number);
    __isDynSJSColor: boolean;
    r: number;
    g: number;
    b: number;
    a: number;
    toHsl(): {
        h: number;
        s: number;
        l: number;
        a: number;
    };
    operate(operation: any, operand: any): Color;
    toRGBA(): string;
    toString(): string;
    toHslString(): string;
}
