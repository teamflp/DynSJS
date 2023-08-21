/**
 * Color class
 * @class
 * @property {number} r - Red value
 * @property {number} g - Green value
 * @property {number} b - Blue value
 * @property {number} a - Alpha value
 * @method {Color} fromHex - Create a color from a hexadecimal string
 * @method {Color} fromRgb - Create a color from a rgb string
 */
export class Color {
    /**
     * Creates a new color instance. Alpha value is optional and defaults to 1.
     * @param r
     * @param g
     * @param b
     * @param a
     */
    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    /**
     * Creates a new color instance from a hexadecimal string.
     * @param hex
     * @returns {Color}
     */
    static fromHex(hex) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return new Color(r, g, b);
    }

    /**
     * Creates a new color instance from a rgb string.
     * @param rgb
     * @returns {Color}
     */
    static fromRgb(rgb) {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return new Color(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    /**
     * Performs a color operation.
     * @param operation
     * @param operand
     * @returns {Color}
     */
    operate(operation, operand) {
        switch (operation) {
            case '+':
                this.r += operand;
                this.g += operand;
                this.b += operand;
                break;
            case '-':
                this.r -= operand;
                this.g -= operand;
                this.b -= operand;
                break;
            case '*':
                this.r *= operand;
                this.g *= operand;
                this.b *= operand;
                break;
            case '/':
                if (operand === 0) throw new Error("Division by zero");
                this.r /= operand;
                this.g /= operand;
                this.b /= operand;
                break;
            case '%':
                this.r %= operand;
                this.g %= operand;
                this.b %= operand;
                break;
        }
        return this;
    }

    /**
     * Clamps the color values between 0 and 255 for RGB and 0 and 1 for alpha.
     * @returns {Color}
     */
    clamp() {
        this.r = Math.max(0, Math.min(255, Math.round(this.r)));
        this.g = Math.max(0, Math.min(255, Math.round(this.g)));
        this.b = Math.max(0, Math.min(255, Math.round(this.b)));
        this.a = Math.max(0, Math.min(1, this.a));
        return this;
    }

    // Ajoutez la méthode toRGBA
    toRGBA() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }

    /**
     * Returns a CSS string representation of the color.
     * @returns {string}
     */
    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}