/**
 * Classe pour gérer de manière responsive la taille de la police d'un élément DOM.
 */
export class ResponsiveFontManager {
    /**
     * Crée une instance de ResponsiveFontManager.
     * @param {HTMLElement} element - L'élément dont la taille de la police doit être ajustée.
     * @param {Object} options - Les options pour ajuster la taille de la police.
     * @param {number} [options.minFontSize=12] - La taille de police minimale en pixels.
     * @param {number} [options.maxFontSize=24] - La taille de police maximale en pixels.
     * @param {number} [options.minWindowWidth=300] - La largeur de fenêtre minimale en pixels pour le réglage.
     * @param {number} [options.maxWindowWidth=1400] - La largeur de fenêtre maximale en pixels pour le réglage.
     */
    constructor(element, options = {}) {
        /** @private @type {HTMLElement} */
        this.element = element;
        this.minFontSize = options.minFontSize || 12;
        this.maxFontSize = options.maxFontSize || 24;
        this.minWindowWidth = options.minWindowWidth || 300;
        this.maxWindowWidth = options.maxWindowWidth || 1400;

        window.addEventListener('resize', () => this.adjustFontSize());
        this.adjustFontSize();
    }

    /**
     * Ajuste la taille de la police de l'élément en fonction de la largeur de la fenêtre.
     * @private
     */
    adjustFontSize() {
        const windowWidth = window.innerWidth;
        if (windowWidth <= this.minWindowWidth) {
            this.element.style.fontSize = `${this.minFontSize}px`;
        } else if (windowWidth >= this.maxWindowWidth) {
            this.element.style.fontSize = `${this.maxFontSize}px`;
        } else {
            const ratio = (windowWidth - this.minWindowWidth) / (this.maxWindowWidth - this.minWindowWidth);
            const fontSize = this.minFontSize + (this.maxFontSize - this.minFontSize) * ratio;
            this.element.style.fontSize = `${fontSize}px`;
        }
    }
}
