import { StyleSheet } from '../Classes/StyleSheet.js';
import { colorBlue, colorRed } from './vars.js';
import { tadaKeyframes } from "./animations.js";
import {DynSJS} from "../Classes/DynSJS.js";

const footer = new StyleSheet();

/*footer.rule('footer')
        .setColor(colorDark, 'backgroundColor')
        .set({
            fontSize: '1.2em',
            textAlign: 'center',
            padding: '30px',
        })*/

// Styles principaux pour le footer
footer.rule('footer') // Sélecteur principal
    .setColor(colorRed, 'backgroundColor')
    .set({ width: '100%', padding: '30px', textAlign: 'center' })
    .set(DynSJS.addPrefixes({ width: '100%' }))
    .flexLayout({ direction: 'row', justify: 'center', align: 'center' });


footer.rule('@keyframes tada')
    .set(tadaKeyframes)

footer.rule('footer')
    .nested('b:after')
        .setColor(colorBlue, 'color')
        .set({ fontFamily: '"Font Awesome 5 Free", serif' })
        .setText('\\f015')

// Media Query pour les écrans jusqu'à 768px
footer.rule('footer')
    .media('(max-width: 768px)')
    .nested('p')
    .set({ margin: '0 8px', fontSize: '1.1em' });

// Media Query pour les écrans jusqu'à 576px
footer.rule('footer')
    .media('(max-width: 576px)')
    .nested('p')
    .set({ margin: '0 6px', fontSize: '1em' });

// Media Query pour les écrans jusqu'à 480px
footer.rule('footer')
    .media('(max-width: 480px)')
    .nested('p')
    .set({ margin: '0 4px', fontSize: '0.9em' });

export default footer;
