// --- src/Color.js ---

/**
 * Represents an immutable color with RGBA & HSLA values.
 * @class Color
 * @property {number} r - Red channel value (0-255)
 * @property {number} g - Green channel value (0-255)
 * @property {number} b - Blue channel value (0-255)
 * @property {number} a - Alpha channel value (0-1)
 */
export class Color {
    // Marqueur pour identifier facilement les instances
    __isDynSJSColor = true;

    constructor(r, g, b, a = 1) {
        this.r = Math.max(0, Math.min(255, Math.round(r)));
        this.g = Math.max(0, Math.min(255, Math.round(g)));
        this.b = Math.max(0, Math.min(255, Math.round(b)));
        const parsedA = parseFloat(a ?? 1);
        this.a = Math.max(0, Math.min(1, isNaN(parsedA) ? 1 : parsedA));
        Object.freeze(this);
    }

    static fromHex(hex) {
        if (typeof hex !== 'string' || !hex.startsWith('#')) { throw new Error('Invalid hex: Must start with #.'); }
        const hexVal = hex.slice(1);
        if (!/^[0-9a-fA-F]+$/.test(hexVal)) { throw new Error('Invalid hex: Contains non-hex characters.'); }
        let r, g, b, a = 1;
        if (hexVal.length === 3 || hexVal.length === 4) {
            r = parseInt(hexVal[0] + hexVal[0], 16); g = parseInt(hexVal[1] + hexVal[1], 16); b = parseInt(hexVal[2] + hexVal[2], 16);
            if (hexVal.length === 4) { a = parseInt(hexVal[3] + hexVal[3], 16) / 255; }
        } else if (hexVal.length === 6 || hexVal.length === 8) {
            r = parseInt(hexVal.slice(0, 2), 16); g = parseInt(hexVal.slice(2, 4), 16); b = parseInt(hexVal.slice(4, 6), 16);
            if (hexVal.length === 8) { a = parseInt(hexVal.slice(6, 8), 16) / 255; }
        } else { throw new Error('Invalid hex: Length should be 3, 4, 6, or 8 after #.'); }
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) { throw new Error('Invalid hex: Parsing resulted in NaN.'); }
        return new Color(r, g, b, a);
    }

    static fromRgb(rgb) {
        if (typeof rgb !== 'string') throw new Error("Invalid rgb format: Input must be a string.");
        const match = rgb.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
        if (!match) { throw new Error('Invalid rgb format. Expected "rgb(R, G, B)" with digits only.'); }
        return new Color(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    static fromRgba(rgba) {
        if (typeof rgba !== 'string') throw new Error("Invalid rgba format: Input must be a string.");
        const match = rgba.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d+)\s*\)/);
        if (!match) { throw new Error('Invalid rgba format. Expected "rgba(R, G, B, A)" with digits only for RGB.'); }
        return new Color(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
    }

    static fromHsl(h, s, l, a = 1) {
        s = s <= 1 ? s : s / 100; l = l <= 1 ? l : l / 100; h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
        if (s === 0) { const gray = Math.round(l * 255); return new Color(gray, gray, gray, a); }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; const hNorm = h / 360;
        const hueToRgb = (t) => { t = (t + 1) % 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
        const r = Math.round(hueToRgb(hNorm + 1 / 3) * 255); const g = Math.round(hueToRgb(hNorm) * 255); const b = Math.round(hueToRgb(hNorm - 1 / 3) * 255);
        return new Color(r, g, b, a);
    }

    toHsl() { const r = this.r / 255, g = this.g / 255, b = this.b / 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h = 0, s = 0, l = (max + min) / 2; if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = (g - b) / d + (g < b ? 6 : 0); break; case g: h = (b - r) / d + 2; break; case b: h = (r - g) / d + 4; break; } h /= 6; } return { h: Math.round(h * 360), s: s, l: l, a: this.a }; }
    operate(operation, operand) { let { r, g, b } = this; switch (operation) { case '+': r += operand; g += operand; b += operand; break; case '-': r -= operand; g -= operand; b -= operand; break; case '*': r *= operand; g *= operand; b *= operand; break; case '/': if (operand === 0) throw new Error("Division by zero is not allowed."); r /= operand; g /= operand; b /= operand; break; case '%': if (operand === 0) throw new Error("Modulo by zero is not allowed."); r %= operand; g %= operand; b %= operand; break; default: console.warn(`Invalid color operation: ${operation}`); return this; } return new Color(r, g, b, this.a); }
    toRGBA() { return `rgba(${this.r},${this.g},${this.b},${this.a})`; }

    toString() {
        const alphaRounded = Math.round(this.a * 100) / 100;
        return alphaRounded === 1 ? `rgb(${this.r},${this.g},${this.b})` : `rgba(${this.r},${this.g},${this.b},${alphaRounded})`;
    }

    toHslString() { const { h, s, l, a } = this.toHsl(); const sPercent = Math.round(s * 100); const lPercent = Math.round(l * 100); const alphaRounded = Math.round(a * 100) / 100; return alphaRounded === 1 ? `hsl(${h}, ${sPercent}%, ${lPercent}%)` : `hsla(${h}, ${sPercent}%, ${lPercent}%, ${alphaRounded})`; }
}