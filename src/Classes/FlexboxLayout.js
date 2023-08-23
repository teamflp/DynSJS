/**
 * Classe pour gérer un layout Flexbox.
 */
export class FlexboxLayout {
    /**
     * Crée une instance de FlexboxLayout.
     * @param {HTMLElement} container - L'élément parent flex container.
     */
    constructor(container) {
        /** @private @type {HTMLElement} */
        this.container = container;
        this.container.style.display = 'flex';
    }

    /**
     * Définit l'orientation du layout Flexbox.
     * @param {'row' | 'column'} direction - L'orientation du flexbox.
     */
    setDirection(direction = 'row') {
        this.container.style.flexDirection = direction;
    }

    /**
     * Ajoute un élément enfant au layout Flexbox.
     * @param {HTMLElement} child - L'élément enfant à ajouter.
     * @param {string} flex - La propriété flex pour l'élément enfant.
     */
    addChild(child, flex = '0 1 auto') {
        child.style.flex = flex;
        this.container.appendChild(child);
    }

    /**
     * Retire un élément enfant du layout Flexbox.
     * @param {HTMLElement} child - L'élément enfant à retirer.
     */
    removeChild(child) {
        this.container.removeChild(child);
    }

    /**
     * Définit l'alignement des éléments enfants sur l'axe principal.
     * @param {'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'} justify - L'alignement des éléments enfants.
     */
    setJustifyContent(justify = 'flex-start') {
        this.container.style.justifyContent = justify;
    }

    /**
     * Définit l'alignement des éléments enfants sur l'axe transversal.
     * @param {'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'} align - L'alignement des éléments enfants.
     */
    setAlignItems(align = 'flex-start') {
        this.container.style.alignItems = align;
    }
}

export default FlexboxLayout;
