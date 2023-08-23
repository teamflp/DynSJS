/**
 * Classe pour gérer les pseudo-éléments d'un élément DOM.
 */
export class PseudoElementManager {
    /**
     * Crée une instance de PseudoElementManager.
     * @param {HTMLElement} element - L'élément parent auquel le pseudo-élément est attaché.
     */
    constructor(element) {
        /** @private @type {HTMLElement} */
        this.element = element;
    }

    /**
     * Récupère la valeur d'une propriété CSS d'un pseudo-élément.
     * @param {string} pseudoElement - Le pseudo-élément (::before, ::after, etc.).
     * @param {string} property - La propriété CSS à récupérer.
     * @returns {string} La valeur de la propriété.
     */
    getStyle(pseudoElement, property) {
        const computedStyle = window.getComputedStyle(this.element, pseudoElement);
        return computedStyle.getPropertyValue(property).trim();
    }

    /**
     * Définit une propriété CSS pour un pseudo-élément.
     * Note: Cette méthode utilise une nouvelle règle CSS, et l'ajoute à la feuille de style du document.
     * @param {string} pseudoElement - Le pseudo-élément (::before, ::after, etc.).
     * @param {string} property - La propriété CSS à définir.
     * @param {string} value - La valeur à assigner à la propriété.
     */
    setStyle(pseudoElement, property, value) {
        const stylesheet = document.styleSheets[0];
        const selector = `${this.element.tagName.toLowerCase()}${pseudoElement}`;
        const rule = `${selector} { ${property}: ${value}; }`;

        if (stylesheet.insertRule) {
            stylesheet.insertRule(rule, stylesheet.cssRules.length);
        }
    }
}