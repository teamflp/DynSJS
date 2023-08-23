/**
 * @class KeyframesAnimation
 *
 * Classe pour gérer des animations basées sur des keyframes pour des éléments DOM.
 */
export class KeyframesAnimation {
    /**
     * Construit un nouveau gestionnaire d'animations keyframes.
     *
     * @param {HTMLElement} element - L'élément DOM sur lequel appliquer l'animation.
     */
    constructor(element) {
        this.element = element;
        this.animationName = '';
        this.stylesheet = document.styleSheets[0]; // Assumer que le premier stylesheet est le principal
    }

    /**
     * Crée une animation basée sur des keyframes.
     *
     * @param {string} name - Le nom de l'animation.
     * @param {Object} frames - Les keyframes sous forme d'objet (ex. { '0%': { 'top': '0px' }, '100%': { 'top': '100px' } }).
     */
    createKeyframes(name, frames) {
        let keyframesString = `@keyframes ${name} {`;

        for (let key in frames) {
            keyframesString += `${key} {`;

            for (let prop in frames[key]) {
                keyframesString += `${prop}: ${frames[key][prop]};`;
            }

            keyframesString += `}`;
        }

        keyframesString += `}`;

        this.stylesheet.insertRule(keyframesString, this.stylesheet.cssRules.length);
        this.animationName = name;
    }

    /**
     * Applique l'animation à l'élément.
     *
     * @param {number} duration - La durée de l'animation en millisecondes.
     * @param {number} [iterations=1] - Le nombre d'itérations de l'animation.
     * @param {string} [direction='normal'] - La direction de l'animation (normal, reverse, alternate, etc.).
     * @param {string} [timingFunction='ease'] - La fonction d'atténuation de l'animation.
     */
    applyAnimation(duration, iterations = 1, direction = 'normal', timingFunction = 'ease') {
        if (!this.animationName) {
            throw new Error("Aucune animation keyframe n'a été créée.");
        }

        this.element.style.animation = `${this.animationName} ${duration}ms ${timingFunction} ${iterations} ${direction}`;
    }

    /**
     * Supprime l'animation de l'élément.
     */
    removeAnimation() {
        this.element.style.animation = '';
    }

    /**
     * Efface l'animation keyframes du stylesheet.
     */
    clearKeyframes() {
        for (let i = 0; i < this.stylesheet.cssRules.length; i++) {
            let rule = this.stylesheet.cssRules[i];
            if (rule.name === this.animationName && 'keyText' in rule) {
                this.stylesheet.deleteRule(i);
                break;
            }
        }

        this.animationName = '';
    }

}

