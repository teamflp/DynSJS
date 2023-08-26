import { StyleSheet } from '../Classes/StyleSheet.js';
import { colorDark, colorBlack } from './vars.js';

const footer = new StyleSheet();

footer.rule('footer')
    .setColor(colorDark, 'backgroundColor')
    .flexLayout({ display: 'flex', direction: 'row', justify: 'center', align: 'center' });

footer.rule('footer')
    .nested('p')
    .setColor(colorBlack, 'color')
    .set({ margin: '0 10px', fontSize: '1.2em' });

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
