import { StyleSheet } from '../Classes/StyleSheet.js';
import { colorBlack, colorOrange } from './vars.js';
import { tadaAnimation, tadaKeyframes } from "./animations.js";

const article = new StyleSheet();

article.rule('.container')
    .set({ padding: '10px 0', width: '90%', maxWidth: '100%', margin: '0 auto' })

article.rule('.container')
    .nested('h1','h3')
        .set({ fontSize: '24px', marginBottom: '20px'})
        .setColor(colorBlack, 'color')
    //.end()

article.rule('article')
    .nested('p')
        .set({ fontSize: '16px', lineHeight: '1.5' })
        //.setTransform({ rotate: '45deg', scale: '1.5' });

article.rule('@keyframes tada')
    .set(tadaKeyframes)

article.rule('article')
    .nested('button')
        .set({ padding: '10px 20px', border: 'none', borderRadius: '5px', color: '#fff', fontSize: '16px', cursor: 'pointer' })
        .setColor(colorBlack, 'backgroundColor')
        .setTransition('all 0.8s ease-in-out 0s')
        .setAnimation(tadaAnimation)

article.rule('article')
    .nested('button i')
        .set({ marginRight: '10px' })

article.rule('article')
    .nested('button:hover')
        .setColor(colorOrange, 'backgroundColor')
        .setTransition('all 0.8s ease-in-out 0s')

// Grid
/*article.rule('.container')
    .flexLayout({ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' })*/

article.rule('.container')
    .nested('img')
        .set({
            width: '40%',
            height: '50vh',
            borderRadius: '5px',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        })

// Media Query pour les écrans jusqu'à 768px
article.rule('.container')
    .media('(max-width: 768px)')
        .set({ width: '100%' })
        .nested('h1', 'h3')
            .set({ fontSize: '20px' });

article.rule('.container')
    .media('(max-width: 768px)',
        '(max-width: 576px)',
        '(max-width: 480px)',
        '(max-width: 320px)',
        '(orientation: portrait)',
        '(orientation: landscape)')
        .flexLayout({ display: 'flex', flexDirection: 'column' })

article.rule('.container')
    .media(
        '(max-width: 768px)',
        '(max-width: 576px)',
        '(max-width: 480px)',
        '(max-width: 320px)',
        '(orientation: portrait)',
        '(orientation: landscape)')
        .nested('p')
            .set({ fontSize: '20px', width: '100%' })
        .flexLayout({ display: 'flex', direction: 'column' })

article.rule('.container')
    .media(
        '(max-width: 768px)',
        '(max-width: 576px)',
        '(max-width: 480px)',
        '(max-width: 320px)',
        '(orientation: portrait)',
        '(orientation: landscape)')
        .nested('img')
            .set({ width: '100%', height: '40vh' })

// Media Query pour les écrans jusqu'à 576px
article.rule('.container')
    .media('(max-width: 768px)',
        '(max-width: 576px)',
        '(max-width: 480px)',
        '(max-width: 320px)',
        '(orientation: portrait)',
        '(orientation: landscape)')
        .set({ width: '100%' })
        .nested('h1', 'h3')
            .set({ fontSize: '20px' });

article.rule('.container')
    .media('(max-width: 768px)',
        '(max-width: 576px)',
        '(max-width: 480px)',
        '(max-width: 320px)',
        '(orientation: portrait)',
        '(orientation: landscape)')
        .set({ maxWidth: '100%' })
        .nested('p')
            .set({ fontSize: '20px' });

// Media Query pour les écrans jusqu'à 480px
article.rule('.container')
    .media('(max-width: 768px)',
        '(max-width: 576px)',
        '(max-width: 480px)',
        '(max-width: 320px)',
        '(orientation: portrait)',
        '(orientation: landscape)')
        .set({ width: '100%' })
        .nested('h1', 'h3')
            .set({ fontSize: '20px' });

article.rule('.container')
    .media('(max-width: 480px)')
        .set({ width: '100%' })
        .nested('p')
            .set({ fontSize: '20px' });

export default article;
