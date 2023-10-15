
import { StyleSheet } from '../Classes/StyleSheet.js';
import {colorBlack, colorWhite, colorYellow} from "./vars.js";

const nav = new StyleSheet();

// put your styles here.

nav.rule('nav')
    .set({ padding: '15px 0' })
    .setColor(colorBlack, 'backgroundColor')
    .flexLayout({
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
    })

nav.rule('.logo')
    .set({ width: '20%' })
    .flexLayout({
        display: 'flex',
        justifyContent: 'start',
        alignItems: 'center',
    })

nav.rule('nav a')
    .set({
        textDecoration: 'none',
        paddingBottom: '5px',
    })
    .setTransition('all 0.5s ease-in-out')
    .setColor(colorYellow, 'color')

nav.rule('nav a:hover')
    .setColor(colorWhite, 'color')
    .set({ borderBottom: '1px solid #fff' })

nav.rule('.navbar')
    .set({width: '40%'})
    .flexLayout({
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        alignContent: 'center',
    })

nav.rule('.form-search')
    .flexLayout({
        display: 'flex',
        justifyContent: 'end',
        alignContent: 'center',
    })

nav.rule('input')
    .set({
        padding: '10px',
        border: 'none',
    })

nav.rule('button[type="submit"]')
    .setColor(colorBlack, 'color' )
    .set({
       padding: '10px',
       border: 'none',
       marginLeft: '0',
       cursor: 'pointer',
       outline: 'none',
    })

// Media queries

nav.rule('nav')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .set({
            padding: '10px 0',
            textAlign: 'center',
            flexDirection: 'column',
            alignItems: 'center',
        });

// on cache les liens de la navbar
nav.rule('nav')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .nested('.navbar a')
            .set({
                display: 'none',
            })

nav.rule('nav')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .set({width: '100%',})
        .nested('.logo a')
            .set({display: 'block',})
        .nested('.form-search input')
            .set({width: '100%'})

nav.rule('nav')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .set({width: '100%',})
        .nested('.logo a')
            .set({display: 'block',})

nav.rule('nav')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .nested('.form-search input')
            .set({width: '100%'})

nav.rule('.navbar')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .set({width: '50%'})

export default nav;
