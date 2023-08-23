/**
 * Classe pour gérer les variables CSS d'un élément DOM.
 */
export class VariableManager {
    /**
     * Crée une instance de VariableManager.
     * @param {HTMLElement} element - L'élément sur lequel les variables sont définies.
     */
    constructor(element) {
        /** @private @type {HTMLElement} */
        this.element = element;
    }

    /**
     * Récupère la valeur d'une variable CSS de l'élément.
     * @param {string} varName - Le nom de la variable (doit commencer par "--").
     * @returns {string} La valeur de la variable.
     */
    get(varName) {
        return this.element.style.getPropertyValue(varName).trim();
    }

    /**
     * Définit une variable CSS pour l'élément.
     * @param {string} varName - Le nom de la variable (doit commencer par "--").
     * @param {string} value - La valeur à assigner à la variable.
     */
    set(varName, value) {
        this.element.style.setProperty(varName, value);
    }

    /**
     * Supprime une variable CSS de l'élément.
     * @param {string} varName - Le nom de la variable à supprimer (doit commencer par "--").
     */
    remove(varName) {
        this.element.style.removeProperty(varName);
    }

    /**
     * Vérifie si une variable CSS est définie sur l'élément.
     * @param {string} varName - Le nom de la variable à vérifier (doit commencer par "--").
     * @returns {boolean} Vrai si la variable est définie, faux sinon.
     */
    has(varName) {
        return !!this.get(varName);
    }
}