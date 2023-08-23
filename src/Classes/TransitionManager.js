/**
 * @class TransitionManager
 *
 * Classe pour gérer des transitions sur des éléments DOM.
 */
export class TransitionManager {
    /**
     * Construit un nouveau gestionnaire de transitions.
     */
    constructor() {
        this.transitions = new Map();
        this.activeTransitions = new Set();
    }

    /**
     * Ajoute une nouvelle transition au gestionnaire.
     *
     * @param {string} name - Le nom de la transition.
     * @param {HTMLElement} element - L'élément DOM sur lequel appliquer la transition.
     * @param {Object} properties - Les propriétés CSS à animer.
     * @param {number} [duration=300] - La durée de la transition en millisecondes.
     * @param {string} [easing='linear'] - La fonction d'atténuation de la transition.
     */
    addTransition(name, element, properties, duration = 300, easing = 'linear') {
        if (!element || !properties) {
            throw new Error("L'élément et les propriétés sont requis pour ajouter une transition.");
        }

        this.transitions.set(name, {
            element,
            properties,
            duration,
            easing
        });
    }

    /**
     * Démarre une transition en utilisant le nom spécifié.
     *
     * @param {string} name - Le nom de la transition à démarrer.
     */
    startTransition(name) {
        const transition = this.transitions.get(name);

        if (!transition) {
            throw new Error(`La transition "${name}" n'existe pas.`);
        }

        if (this.activeTransitions.has(name)) {
            return; // Transition déjà en cours
        }

        this.activeTransitions.add(name);

        const { element, properties, duration, easing } = transition;

        element.style.transition = `all ${duration}ms ${easing}`;

        requestAnimationFrame(() => {
            for (let prop in properties) {
                element.style[prop] = properties[prop];
            }
        });

        const transitionEndListener = () => {
            this.activeTransitions.delete(name);
            element.removeEventListener('transitionend', transitionEndListener);
        };

        element.addEventListener('transitionend', transitionEndListener);
    }

    /**
     * Révoque une transition en utilisant le nom spécifié.
     *
     * @param {string} name - Le nom de la transition à révoquer.
     */
    revertTransition(name) {
        const transition = this.transitions.get(name);

        if (!transition || !this.activeTransitions.has(name)) {
            return; // Transition non existante ou non active
        }

        const { element, properties } = transition;

        for (let prop in properties) {
            element.style[prop] = '';
        }

        this.activeTransitions.delete(name);
    }

    /**
     * Efface toutes les transitions du gestionnaire.
     */
    clearTransitions() {
        this.activeTransitions.forEach((name) => this.revertTransition(name));
        this.transitions.clear();
    }
}

