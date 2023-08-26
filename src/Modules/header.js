import { StyleSheet } from '../Classes/StyleSheet.js';
import { colorYellow, colorBlack } from './vars.js';

const header = new StyleSheet();

header.rule('nav', 'footer')
    .setColor(colorBlack, 'backgroundColor')
    .set({ padding: '20px 20px' })
    .flexLayout({ display: 'flex', direction: 'row', align: 'center' });

header.rule('nav a')
    .setColor(colorYellow, 'color')
    .set({ margin: '0 10px', textDecoration: 'none'});

// Media Query pour les écrans jusqu'à 768px
header.rule('header')
    .media('(max-width: 768px)')
        .nested('nav')
            .set({ padding: '15px 15px' });

header.rule('nav a')
    .media('(max-width: 768px)')
        .set({ margin: '0 8px' });

// Media Query pour les écrans jusqu'à 576px
header.rule('header')
    .media('(max-width: 576px)')
        .nested('nav')
            .set({ padding: '10px 10px' });

header.rule('nav a')
    .media('(max-width: 576px)')
        .set({ margin: '0 6px' });

// Media Query pour les écrans jusqu'à 480px
header.rule('header')
    .media('(max-width: 480px)')
        .nested('nav')
            .set({ padding: '5px 5px' });

header.rule('nav a')
    .media('(max-width: 480px)')
        .set({ margin: '0 4px' });

export default header;
