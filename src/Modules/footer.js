import { StyleSheet } from '../Classes/StyleSheet.js';
import { colorRed, colorGreen, colorWhite, colorYellow } from './vars.js';

const footer = new StyleSheet();

footer.rule('div');
footer.rule('footer')
    .setColor(colorRed, 'backgroundColor')
    .set({width: '50%'})
    .transitionManager({ backgroundColor: '0.5s', width: '0.3s' }) // Utilisation de transitionManager
    .flexLayout({ direction: 'row', justify: 'center', align: 'center' })

footer.rule('footer')
    .nested('p')
    .setColor(colorGreen, 'backgroundColor', colorWhite, 'color')
    .set({textAlign: 'center', padding: '10px', width: '100%'})
    .transitionManager({ backgroundColor: '0.5s', color: '0.5s' }) // Utilisation de transitionManager
    .nested('::before')
    .setText("C'est le footer!")
    .end();

footer.rule('footer')
    .nested('p');

footer.rule('footer')
    .nested('button:hover')
    .setColor(colorGreen, 'backgroundColor')
    .transitionManager({ backgroundColor: '0.3s' }); // Utilisation de transitionManager

footer.rule('footer')
    .nested('button:focus')
    .setColor(colorYellow, 'backgroundColor')
    .transitionManager({ backgroundColor: '0.3s' }); // Utilisation de transitionManager

export default footer;
