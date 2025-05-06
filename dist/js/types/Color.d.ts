/**
 * Represents an immutable color with RGBA & HSLA values.
 * @class Color
 */
export declare class Color {
    readonly __isDynSJSColor = true;
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly a: number;
    constructor(r: number, g: number, b: number, a?: number | string);
    static fromHex(hex: string): Color;
    static fromRgb(rgb: string): Color;
    static fromRgba(rgba: string): Color;
    static fromHsl(h: number, s: number, l: number, a?: number | string): Color;
    toHsl(): {
        h: number;
        s: number;
        l: number;
        a: number;
    };
    operate(operation: '+' | '-' | '*' | '/' | '%', operand: number): Color;
    toRGBA(): string;
    toString(): string;
    toHslString(): string;
}
//# sourceMappingURL=Color.d.ts.map