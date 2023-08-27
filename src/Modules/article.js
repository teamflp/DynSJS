import { StyleSheet } from '../Classes/StyleSheet.js';
import {colorBlack, colorDark, colorOrange} from './vars.js';

const article = new StyleSheet();

article.rule('article')
    .set({ padding: '20px', width: '90%', maxWidth: '100%', margin: '0 auto' });

article.rule('article')
    .nested('h1','h3')
        .set({ fontSize: '24px', marginBottom: '20px'})
        .setColor(colorDark, 'color');

article.rule('article')
    .nested('p')
        .set({ fontSize: '16px', lineHeight: '1.5' })

article.rule('article')
    .nested('button')
        .set({ padding: '10px 20px', border: 'none', borderRadius: '5px', color: '#fff', fontSize: '16px', cursor: 'pointer' })
        .setColor(colorBlack, 'backgroundColor')
        .setTransition('all 0.8s ease-in-out 0s')

article.rule('article')
    .nested('button:hover')
        .setColor(colorOrange, 'backgroundColor')
        .setTransition('all 0.8s ease-in-out 0s')

// Media Query pour les écrans jusqu'à 768px
article.rule('article')
    .media('(max-width: 768px)')
    .nested('h1', 'h3')
        .set({ fontSize: '20px' });


article.rule('article')
    .media('(max-width: 768px)')
    .nested('p')
        .set({ fontSize: '14px' });

// Media Query pour les écrans jusqu'à 576px
article.rule('article')
    .media('(max-width: 576px)')
    .nested('h1', 'h3')
        .set({ fontSize: '18px' });

article.rule('article')
    .media('(max-width: 576px)')
    .nested('p')
        .set({ fontSize: '12px' });

// Media Query pour les écrans jusqu'à 480px
article.rule('article')
    .media('(max-width: 480px)')
    .nested('h1', 'h3')
        .set({ fontSize: '16px' });

article.rule('article')
    .media('(max-width: 480px)')
    .nested('p')
        .set({ fontSize: '10px' });

export default article;
