/**
 * Classe pour gérer un layout CSS Grid.
 */
export class GridLayout {
    /**
     * Crée une instance de GridLayout.
     * @param {HTMLElement} container - L'élément parent grid container.
     */
    constructor(container) {
        /** @private @type {HTMLElement} */
        this.container = container;
        this.container.style.display = 'grid';
    }

    /**
     * Définit les pistes (tracks) des colonnes pour le grid.
     * @param {string} template - La définition des pistes des colonnes.
     */
    setColumnTemplate(template) {
        this.container.style.gridTemplateColumns = template;
    }

    /**
     * Définit les pistes des lignes pour le grid.
     * @param {string} template - La définition des pistes des lignes.
     */
    setRowTemplate(template) {
        this.container.style.gridTemplateRows = template;
    }

    /**
     * Ajoute un élément enfant au layout Grid.
     * @param {HTMLElement} child - L'élément enfant à ajouter.
     * @param {string} [area] - Le nom de la zone grid à laquelle l'élément est assigné.
     */
    addChild(child, area) {
        if (area) {
            child.style.gridArea = area;
        }
        this.container.appendChild(child);
    }

    /**
     * Définit les espaces entre les pistes (gutters) du grid.
     * @param {string} rowGap - L'espace entre les lignes.
     * @param {string} columnGap - L'espace entre les colonnes.
     */
    setGaps(rowGap, columnGap) {
        this.container.style.gridRowGap = rowGap;
        this.container.style.gridColumnGap = columnGap;
    }

    /**
     * Définit un template pour les zones (areas) du grid.
     * @param {string} template - Le template des zones en utilisant les noms des zones.
     */
    setAreasTemplate(template) {
        this.container.style.gridTemplateAreas = template;
    }
}
