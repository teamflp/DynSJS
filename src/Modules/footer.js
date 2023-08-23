import { StyleSheet } from '../Classes/StyleSheet.js';
import { Color } from '../Classes/Color.js';

const footer = new StyleSheet();

const colorRed = new Color(255, 0, 0, 0.5);
const colorGreen = new Color(0, 255, 0, 0.5)
const colorYellow = new Color(255, 255, 0, 0.25 )

footer.rule('div')
footer.rule('footer')
    .setColor(colorRed, 'backgroundColor')
    .set({width: '100%'})
    .flexLayout({ direction: 'row', justify: 'center', align: 'center' })

footer.rule('footer')
    .nested('p')
        .setColor(colorGreen, 'backgroundColor')
        .set({color: '#FFFFFF', textAlign: 'center', padding: '10px', width: '100%'})
    .nested('::before')
        .setText("C'est le footer!")

footer.rule('footer')
    .nested('p')

footer.rule('footer')
    .nested('button:hover')
    .setColor(colorGreen, 'backgroundColor')

footer.rule('footer')
    .nested('button:focus')
    .setColor(colorYellow, 'backgroundColor')

export default footer;