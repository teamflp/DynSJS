/**
 * Classe ColorManager (Couleur)
 * @class
 * @property {number} r - Valeur de Rouge
 * @property {number} g - Valeur de Vert
 * @property {number} b - Valeur de Bleu
 * @property {number} a - Valeur d'Alpha
 * @example
 * // Pour un exemple complet d'utilisation de la classe ColorManager,
 * // veuillez consulter le module footer.js.
 * const redColor = new ColorManager(255, 0, 0);
 * const greenColor = ColorManager.fromHex("#00FF00");
 * console.log(greenColor.toRGBA());  // "rgba(0,255,0,1)"
 */
export class ColorManager {
    /**
     * Crée une nouvelle instance de couleur. La valeur alpha est optionnelle et par défaut à 1.
     * @param r
     * @param g
     * @param b
     * @param a
     * @example
     * const redColor = new ColorManager(255, 0, 0);
     */
    constructor(r, g, b, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static fromHex(hex) {
        if (typeof hex !== "string" || !/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(hex)) {
            throw new Error("L'argument fourni n'est pas une chaîne hexadécimale valide.");
        }

        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return new ColorManager(r, g, b);
    }


    /**
     * Crée une nouvelle instance de couleur à partir d'une chaîne RGB.
     * @param rgb
     * @returns {ColorManager}
     * @example
     * const greenColor = ColorManager.fromRgb("rgb(0, 255, 0)");
     */
    static fromRgb(rgb) {
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        return new ColorManager(Number(match[1]), Number(match[2]), Number(match[3]));
    }

    /**
     * Effectue une opération sur la couleur.
     * @param operation
     * @param operand
     * @returns {ColorManager}
     * @example
     * const color = new ColorManager(100, 100, 100);
     * color.operate('+', 50);  // Résultat : r=150, g=150, b=150
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
                if (operand === 0) throw new Error("Division par zéro");
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
     * Limite les valeurs de couleur entre 0 et 255 pour RGB et entre 0 et 1 pour alpha.
     * @returns {ColorManager}
     * @example
     * const color = new ColorManager(300, -20, 100);
     * color.clamp();  // Résultat : r=255, g=0, b=100
     */
    clamp() {
        this.r = Math.max(0, Math.min(255, Math.round(this.r)));
        this.g = Math.max(0, Math.min(255, Math.round(this.g)));
        this.b = Math.max(0, Math.min(255, Math.round(this.b)));
        this.a = Math.max(0, Math.min(1, this.a));
        return this;
    }

    /**
     * Convertit la couleur en une chaîne RGBA.
     * @returns {string}
     * @example
     * const color = new ColorManager(255, 0, 0, 0.5);
     * console.log(color.toRGBA());  // "rgba(255,0,0,0.5)"
     */
    toRGBA() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }

    /**
     * Renvoie une représentation en chaîne CSS de la couleur.
     * @returns {string}
     * @example
     * const color = new ColorManager(0, 0, 255, 1);
     * console.log(color.toString());  // "rgba(0, 0, 255, 1)"
     */
    toString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}
