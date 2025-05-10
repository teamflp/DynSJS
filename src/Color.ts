// --- src/Color.ts ---

/**
 * Représente une couleur immuable avec des valeurs RGBA et des capacités de conversion HSLA.
 * Une fois créée, une instance `Color` ne peut pas être modifiée directement ; les opérations
 * sur les couleurs (comme `operate`) retournent de nouvelles instances `Color`.
 * @class Color
 * @example
 * const red = new Color(255, 0, 0);
 * const semiTransparentBlue = Color.fromHex('#0000FF80');
 * console.log(red.toString()); // "rgb(255,0,0)"
 * console.log(semiTransparentBlue.toRGBA()); // "rgba(0,0,255,0.5019607843137255)" (l'alpha est précis)
 */
export class Color {
    /**
     * Valeur du canal Rouge, contrainte entre 0 et 255.
     * @readonly
     */
    readonly r: number;
    /**
     * Valeur du canal Vert, contrainte entre 0 et 255.
     * @readonly
     */
    readonly g: number;
    /**
     * Valeur du canal Bleu, contrainte entre 0 et 255.
     * @readonly
     */
    readonly b: number;
    /**
     * Valeur du canal Alpha (opacité), contrainte entre 0 (transparent) et 1 (opaque).
     * @readonly
     */
    readonly a: number;

    /**
     * @internal Marqueur pour identifier facilement les instances de Color en interne par DynSJS.
     * @readonly
     */
    readonly __isDynSJSColor = true;

    /**
     * Crée une instance immuable de Color.
     * Les valeurs RGB sont contraintes entre 0 et 255 et arrondies à l'entier le plus proche.
     * La valeur Alpha est contrainte entre 0 et 1.
     * @param {number} r - Valeur du canal Rouge (0-255).
     * @param {number} g - Valeur du canal Vert (0-255).
     * @param {number} b - Valeur du canal Bleu (0-255).
     * @param {number | string} [a=1] - Valeur du canal Alpha (0-1). Peut être une chaîne qui sera parsée en nombre. Défaut à 1.
     */
    constructor(r: number, g: number, b: number, a: number | string = 1) {
        this.r = Math.max(0, Math.min(255, Math.round(r)));
        this.g = Math.max(0, Math.min(255, Math.round(g)));
        this.b = Math.max(0, Math.min(255, Math.round(b)));
        const parsedA = parseFloat(String(a ?? 1)); // String() pour gérer number | string, ?? 1 pour null/undefined
        this.a = Math.max(0, Math.min(1, isNaN(parsedA) ? 1 : parsedA));
        Object.freeze(this); // Rend l'instance immuable
    }

    /**
     * Crée une instance `Color` à partir d'une chaîne hexadécimale.
     * Supporte les formats #RGB, #RRGGBB, #RGBA (ex: #F00F), #RRGGBBAA.
     * @param {string} hex - La chaîne de couleur hexadécimale (ex: "#FF0000", "#F00", "#FF000080", "#0F08").
     * @returns {Color} Une nouvelle instance Color.
     * @throws {Error} Si le format de la chaîne hexadécimale est invalide.
     * @example
     * const red = Color.fromHex('#FF0000');
     * const semiTransparentGreen = Color.fromHex('#0F08'); // Équivaut à #00FF0088
     */
    static fromHex(hex: string): Color {
        if (typeof hex !== 'string' || !hex.startsWith('#')) { throw new Error('DynSJS Color: Invalid hex format. Must start with #.'); }
        const hexVal = hex.slice(1);
        if (!/^[0-9a-fA-F]+$/.test(hexVal)) { throw new Error('DynSJS Color: Invalid hex format. Contains non-hex characters.'); }
        let r: number, g: number, b: number, aNum: number = 1;
        if (hexVal.length === 3 || hexVal.length === 4) {
            r = parseInt(hexVal[0] + hexVal[0], 16); g = parseInt(hexVal[1] + hexVal[1], 16); b = parseInt(hexVal[2] + hexVal[2], 16);
            if (hexVal.length === 4) { aNum = parseInt(hexVal[3] + hexVal[3], 16) / 255; }
        } else if (hexVal.length === 6 || hexVal.length === 8) {
            r = parseInt(hexVal.slice(0, 2), 16); g = parseInt(hexVal.slice(2, 4), 16); b = parseInt(hexVal.slice(4, 6), 16);
            if (hexVal.length === 8) { aNum = parseInt(hexVal.slice(6, 8), 16) / 255; }
        } else { throw new Error('DynSJS Color: Invalid hex format. Length must be 3, 4, 6, or 8 characters after #.'); }
        if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(aNum)) { throw new Error('DynSJS Color: Invalid hex format. Parsing resulted in NaN values.'); }
        return new Color(r, g, b, aNum);
    }

    /**
     * Crée une instance `Color` à partir d'une chaîne "rgb()".
     * Les valeurs doivent être des nombres entiers entre 0 et 255.
     * @param {string} rgb - La chaîne de couleur (ex: "rgb(255, 0, 128)").
     * @returns {Color} Une nouvelle instance Color.
     * @throws {Error} Si le format de la chaîne rgb est invalide.
     * @example
     * const myColor = Color.fromRgb('rgb(50, 100, 150)');
     */
    static fromRgb(rgb: string): Color {
        if (typeof rgb !== 'string') { throw new Error("DynSJS Color: Invalid rgb format. Input must be a string."); }
        const match = rgb.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/);
        if (!match) { throw new Error('DynSJS Color: Invalid rgb format. Expected "rgb(R, G, B)" with digits only.'); }
        return new Color(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    /**
     * Crée une instance `Color` à partir d'une chaîne "rgba()".
     * Les valeurs RGB doivent être des nombres entiers entre 0 et 255. Alpha est un nombre entre 0 et 1.
     * @param {string} rgba - La chaîne de couleur (ex: "rgba(255, 0, 128, 0.5)").
     * @returns {Color} Une nouvelle instance Color.
     * @throws {Error} Si le format de la chaîne rgba est invalide.
     * @example
     * const transparentColor = Color.fromRgba('rgba(70, 130, 180, 0.75)');
     */
    static fromRgba(rgba: string): Color {
        if (typeof rgba !== 'string') { throw new Error("DynSJS Color: Invalid rgba format. Input must be a string."); }
        const match = rgba.match(/rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*([01]?\.?\d+)\s*\)/);
        if (!match) { throw new Error('DynSJS Color: Invalid rgba format. Expected "rgba(R, G, B, A)" with digits only for RGB.'); }
        return new Color(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]));
    }

    /**
     * Crée une instance `Color` à partir de valeurs HSL(A) (Teinte, Saturation, Luminosité, Alpha).
     * @param {number} h - Teinte, valeur entre 0 et 360.
     * @param {number} s - Saturation. Si <= 1, interprété comme 0-1. Sinon, interprété comme 0-100 et converti en 0-1.
     * @param {number} l - Luminosité. Si <= 1, interprété comme 0-1. Sinon, interprété comme 0-100 et converti en 0-1.
     * @param {number | string} [a=1] - Alpha (0-1). Défaut à 1.
     * @returns {Color} Une nouvelle instance Color.
     * @example
     * const teal = Color.fromHsl(180, 0.5, 0.5); // HSL(180, 50%, 50%)
     * const semiTransparentPurple = Color.fromHsl(300, 75, 60, 0.5); // HSLA(300, 75%, 60%, 0.5)
     */
    static fromHsl(h: number, s: number, l: number, a: number | string = 1): Color {
        s = s <= 1 ? Math.max(0, Math.min(1, s)) : Math.max(0, Math.min(1, s / 100));
        l = l <= 1 ? Math.max(0, Math.min(1, l)) : Math.max(0, Math.min(1, l / 100));
        h = ((h % 360) + 360) % 360; // Normalise h entre 0 et 359.99...

        if (s === 0) { const gray = Math.round(l * 255); return new Color(gray, gray, gray, a); } // Achromatic

        const hueToRgbComponent = (p: number, q: number, t: number): number => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        const hNormalized = h / 360;

        const r = Math.round(hueToRgbComponent(p, q, hNormalized + 1 / 3) * 255);
        const g = Math.round(hueToRgbComponent(p, q, hNormalized) * 255);
        const b = Math.round(hueToRgbComponent(p, q, hNormalized - 1 / 3) * 255);

        return new Color(r, g, b, a);
    }

    /**
     * Calcule et retourne la représentation HSL(A) de la couleur.
     * @returns {{h: number, s: number, l: number, a: number}} Un objet avec les composantes:
     * `h` (teinte) entre 0 et 360 (arrondi),
     * `s` (saturation) entre 0 et 1,
     * `l` (luminosité) entre 0 et 1,
     * `a` (alpha) entre 0 et 1 (identique à `this.a`).
     */
    toHsl(): { h: number; s: number; l: number; a: number } {
        const rNorm = this.r / 255, gNorm = this.g / 255, bNorm = this.b / 255;
        const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        const d = max - min;

        if (d !== 0) { // Achromatic colors will have d = 0, s = 0, h = 0
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
        }
        return { h: Math.round(h * 360), s: s, l: l, a: this.a };
    }

    /**
     * Effectue une opération arithmétique simple sur les canaux R, G, B de la couleur.
     * Retourne une nouvelle instance `Color` avec les valeurs modifiées (et contraintes entre 0-255).
     * L'alpha n'est pas affecté.
     * @param {'+' | '-' | '*' | '/' | '%'} operation - L'opération à effectuer.
     * @param {number} operand - La valeur à utiliser pour l'opération.
     * @returns {Color} Une nouvelle instance Color résultant de l'opération.
     * @throws {Error} Si une division ou un modulo par zéro est tenté.
     * @example
     * const red = new Color(200, 0, 0);
     * const lighterRed = red.operate('+', 50); // rgb(250, 50, 50) (car 0+50=50)
     * const darkerRed = red.operate('-', 50);  // rgb(150, 0, 0) (car 0-50 clampé à 0)
     * const halfRed = red.operate('/', 2);    // rgb(100, 0, 0)
     */
    operate(operation: '+' | '-' | '*' | '/' | '%', operand: number): Color {
        let { r, g, b } = this; // Crée des copies locales pour modification
        switch (operation) {
            case '+': r += operand; g += operand; b += operand; break;
            case '-': r -= operand; g -= operand; b -= operand; break;
            case '*': r *= operand; g *= operand; b *= operand; break;
            case '/': if (operand === 0) throw new Error("DynSJS Color: Division by zero is not allowed."); r /= operand; g /= operand; b /= operand; break;
            case '%': if (operand === 0) throw new Error("DynSJS Color: Modulo by zero is not allowed."); r %= operand; g %= operand; b %= operand; break;
            default:
                // Pour satisfaire le compilateur TypeScript si une opération invalide était passée (bien que le type l'empêche)
                const exhaustiveCheck: never = operation;
                console.warn(`DynSJS Color: Invalid color operation: ${exhaustiveCheck}`);
                return this;
        }
        return new Color(r, g, b, this.a); // Retourne une nouvelle instance avec les valeurs (qui seront clampées)
    }

    /**
     * Retourne la représentation CSS `rgba(R,G,B,A)` de la couleur.
     * L'alpha est toujours inclus, même s'il est à 1, et est retourné avec sa précision d'origine.
     * @returns {string} La chaîne rgba (ex: "rgba(255,0,100,0.8)", "rgba(0,0,0,1)").
     */
    toRGBA(): string { return `rgba(${this.r},${this.g},${this.b},${this.a})`; }

    /**
     * Retourne une représentation CSS de la couleur, optimisée pour la lisibilité.
     * Produit `rgb(R,G,B)` si l'alpha est 1 (après arrondi à 2 décimales).
     * Sinon, produit `rgba(R,G,B,A)` avec l'alpha arrondi à 2 décimales.
     * @returns {string} La chaîne rgb ou rgba (ex: "rgb(255,0,0)", "rgba(0,0,255,0.5)").
     */
    toString(): string {
        const alphaRounded = Math.round(this.a * 100) / 100;
        return alphaRounded === 1 ? `rgb(${this.r},${this.g},${this.b})` : `rgba(${this.r},${this.g},${this.b},${alphaRounded})`;
    }

    /**
     * Retourne la représentation CSS `hsl(H,S%,L%)` ou `hsla(H,S%,L%,A)` de la couleur.
     * La saturation (S) et la luminosité (L) sont exprimées en pourcentages.
     * L'alpha (A) est arrondi à 2 décimales.
     * @returns {string} La chaîne hsl ou hsla (ex: "hsl(0, 100%, 50%)", "hsla(120, 100%, 50%, 0.5)").
     */
    toHslString(): string {
        const { h, s, l } = this.toHsl(); // Récupère h, s, l. L'alpha est this.a
        const sPercent = Math.round(s * 100);
        const lPercent = Math.round(l * 100);
        const alphaRounded = Math.round(this.a * 100) / 100; // Utilise this.a pour l'alpha
        return alphaRounded === 1 ? `hsl(${h}, ${sPercent}%, ${lPercent}%)` : `hsla(${h}, ${sPercent}%, ${lPercent}%, ${alphaRounded})`;
    }
}