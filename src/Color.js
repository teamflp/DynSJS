// --- src/Color.js ---

/**
 * Represents an immutable color with RGBA & HSLA values.
 * @class Color
 * @property {number} r - Red channel value (0-255)
 * @property {number} g - Green channel value (0-255)
 * @property {number} b - Blue channel value (0-255)
 * @property {number} a - Alpha channel value (0-1)
 * @property {number} h - Hue value (0-360) - Calculated on demand
 * @property {number} s - Saturation value (0-1) - Calculated on demand
 * @property {number} l - Lightness value (0-1) - Calculated on demand
 */
export class Color {
    /**
     * Creates an immutable Color instance.
     * RGB values are clamped between 0-255, Alpha between 0-1.
     * @param {number} r - Red value (0-255)
     * @param {number} g - Green value (0-255)
     * @param {number} b - Blue value (0-255)
     * @param {number} [a=1] - Alpha value (0-1). Defaults to 1.
     */
    constructor(r, g, b, a = 1) {
        // Clamp values directly in constructor to ensure valid state
        this.r = Math.max(0, Math.min(255, Math.round(r)));
        this.g = Math.max(0, Math.min(255, Math.round(g)));
        this.b = Math.max(0, Math.min(255, Math.round(b)));
        // Ensure alpha is float and clamped
        this.a = Math.max(0, Math.min(1, typeof a === 'number' ? a : parseFloat(a || 1)));

        // Make instance immutable
        Object.freeze(this);
    }

    /**
     * Creates a new Color instance from a hexadecimal string.
     * Supports #RGB, #RRGGBB, #RGBA, #RRGGBBAA formats.
     * @param {string} hex - The hexadecimal color string (e.g., "#FF0000", "#F00", "#FF000080").
     * @returns {Color} A new Color instance.
     * @throws {Error} If the hex string format is invalid.
     */
    static fromHex(hex) {
        if (typeof hex !== 'string' || !hex.startsWith('#')) {
            throw new Error('Invalid hex format: Must start with #.');
        }

        const hexVal = hex.slice(1);
        let r, g, b, a = 1;

        if (hexVal.length === 3 || hexVal.length === 4) { // #RGB or #RGBA
            r = parseInt(hexVal[0] + hexVal[0], 16);
            g = parseInt(hexVal[1] + hexVal[1], 16);
            b = parseInt(hexVal[2] + hexVal[2], 16);
            if (hexVal.length === 4) {
                a = parseInt(hexVal[3] + hexVal[3], 16) / 255;
            }
        } else if (hexVal.length === 6 || hexVal.length === 8) { // #RRGGBB or #RRGGBBAA
            r = parseInt(hexVal.slice(0, 2), 16);
            g = parseInt(hexVal.slice(2, 4), 16);
            b = parseInt(hexVal.slice(4, 6), 16);
            if (hexVal.length === 8) {
                a = parseInt(hexVal.slice(6, 8), 16) / 255;
            }
        } else {
            throw new Error('Invalid hex format: Length should be 3, 4, 6, or 8 after #.');
        }

        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
             throw new Error('Invalid hex format: Contains non-hex characters.');
        }

        return new Color(r, g, b, a);
    }

    /**
     * Creates a new Color instance from an rgb string.
     * e.g., "rgb(255, 0, 128)"
     * @param {string} rgb - The rgb color string.
     * @returns {Color} A new Color instance.
     * @throws {Error} If the rgb string format is invalid.
     */
    static fromRgb(rgb) {
        if (typeof rgb !== 'string') throw new Error("Invalid rgb format: Input must be a string.");
        const match = rgb.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
        if (!match) {
            throw new Error('Invalid rgb format. Expected "rgb(R, G, B)".');
        }
        return new Color(Number(match[1]), Number(match[2]), Number(match[3]));
    }

     /**
     * Creates a new Color instance from an rgba string.
     * e.g., "rgba(255, 0, 128, 0.5)"
     * @param {string} rgba - The rgba color string.
     * @returns {Color} A new Color instance.
     * @throws {Error} If the rgba string format is invalid.
     */
    static fromRgba(rgba) {
        if (typeof rgba !== 'string') throw new Error("Invalid rgba format: Input must be a string.");
        // Regex allows for integer or float alpha values
        const match = rgba.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d+)\s*\)/);
        if (!match) {
            throw new Error('Invalid rgba format. Expected "rgba(R, G, B, A)".');
        }
        return new Color(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
    }

    /**
     * Creates a new Color instance from HSL(A) values.
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-1 or 0-100) - Assumed 0-1 if <= 1, else 0-100
     * @param {number} l - Lightness (0-1 or 0-100) - Assumed 0-1 if <= 1, else 0-100
     * @param {number} [a=1] - Alpha (0-1)
     * @returns {Color}
     */
    static fromHsl(h, s, l, a = 1) {
        // Normalize s and l to range 0-1
        s = s <= 1 ? s : s / 100;
        l = l <= 1 ? l : l / 100;
        h = ((h % 360) + 360) % 360; // Normalize h to 0-360

        s = Math.max(0, Math.min(1, s));
        l = Math.max(0, Math.min(1, l));

        if (s === 0) {
            const gray = Math.round(l * 255);
            return new Color(gray, gray, gray, a);
        }

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hNorm = h / 360;

        const hueToRgb = (t) => {
            t = (t + 1) % 1; // Wrap around
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const r = Math.round(hueToRgb(hNorm + 1 / 3) * 255);
        const g = Math.round(hueToRgb(hNorm) * 255);
        const b = Math.round(hueToRgb(hNorm - 1 / 3) * 255);

        return new Color(r, g, b, a);
    }


    /**
     * Calculates and returns the HSL representation.
     * @returns {{h: number, s: number, l: number, a: number}}
     */
    toHsl() {
        const r = this.r / 255;
        const g = this.g / 255;
        const b = this.b / 255;
        const a = this.a;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: s, // Typically represented 0-1
            l: l, // Typically represented 0-1
            a: a
        };
    }

    /**
     * Performs a simple arithmetic operation on the R, G, B channels.
     * Note: This is a basic operation; consider dedicated methods like lighten/darken for more advanced color manipulation.
     * Returns a new Color instance.
     * @param {'+'|'-'|'*'|'/'|'%'} operation - The operation to perform.
     * @param {number} operand - The value to use in the operation.
     * @returns {Color} A new Color instance with the modified values (clamped).
     * @throws {Error} If dividing by zero.
     */
    operate(operation, operand) {
        let { r, g, b } = this; // Use current values

        switch (operation) {
            case '+':
                r += operand; g += operand; b += operand;
                break;
            case '-':
                r -= operand; g -= operand; b -= operand;
                break;
            case '*':
                r *= operand; g *= operand; b *= operand;
                break;
            case '/':
                if (operand === 0) throw new Error("Division by zero is not allowed.");
                r /= operand; g /= operand; b /= operand;
                break;
            case '%':
                 if (operand === 0) throw new Error("Modulo by zero is not allowed.");
                r %= operand; g %= operand; b %= operand;
                break;
            default:
                 console.warn(`Invalid color operation: ${operation}`);
                 return this; // Return original on invalid operation
        }
        // Return a new, clamped instance
        return new Color(r, g, b, this.a);
    }

    /**
     * Returns the CSS rgba() string representation.
     * e.g., "rgba(255,0,100,0.8)"
     * @returns {string}
     */
    toRGBA() {
        // Use clamped values directly from properties
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }

    /**
     * Returns a CSS string representation of the color.
     * Outputs rgb() if alpha is 1, otherwise rgba().
     * @returns {string}
     */
    toString() {
        if (this.a === 1) {
            return `rgb(${this.r},${this.g},${this.b})`;
        } else {
            // Round alpha to avoid excessive decimal places in CSS if needed
            const alphaRounded = Math.round(this.a * 100) / 100;
            return `rgba(${this.r},${this.g},${this.b},${alphaRounded})`;
        }
    }

     /**
     * Returns the HSL(A) CSS string representation.
     * @returns {string} e.g., "hsl(120, 100%, 50%)" or "hsla(120, 50%, 50%, 0.8)"
     */
    toHslString() {
        const { h, s, l, a } = this.toHsl();
        const sPercent = Math.round(s * 100);
        const lPercent = Math.round(l * 100);
        if (a === 1) {
            return `hsl(${h}, ${sPercent}%, ${lPercent}%)`;
        } else {
            // Round alpha to avoid excessive decimal places
            const alphaRounded = Math.round(a * 100) / 100;
            return `hsla(${h}, ${sPercent}%, ${lPercent}%, ${alphaRounded})`;
        }
    }
}