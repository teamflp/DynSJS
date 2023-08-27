/**
 * Génère des classes CSS dynamiquement en utilisant des mixins dynamiques.
 *
 * @param {StyleSheet} stylesheet - L'instance de la feuille de style à laquelle ajouter les classes.
 *
 * @example
 *
 * import { mixins } from './mixins.js';
 * import { StyleSheet } from '../Classes/StyleSheet.js';
 *
 * const stylesheet = new StyleSheet();
 * mixins(stylesheet);
 *
 * // Dans ce cas, la fonction `mixins` ajoutera les classes suivantes à l'instance `stylesheet` :
 * // .texte-1 { font-size: 1.2em; }
 * // .texte-2 { font-size: 1.2em; }
 * // ...
 * // .texte-6 { font-size: 1.2em; }
 * // .m-1 { margin: 10px; }
 * // .m-2 { margin: 20px; }
 * // ...
 * // .m-6 { margin: 60px; }
 */
export function mixins(stylesheet) {
    stylesheet.generateClasses({
        prefix: 'text',
        count: 6,
        properties: i => ({
            fontSize: `${1.2 * i}em`
        })
    });

    stylesheet.generateClasses({
        prefix: 'm',
        count: 6,
        properties: i => ({
            margin: `${10 * i}px`
        })
    });

    stylesheet.generateClasses({
        prefix: 'mb',
        count: 6,
        properties: i => ({
            marginBottom: `${10 * i}px`
        })
    });
}
