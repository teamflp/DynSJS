
import { StyleSheet } from '../Classes/StyleSheet.js';
import {colorBlack, colorWhite, colorYellow} from "./vars.js";

const nav = new StyleSheet();

// put your styles here.

nav.rule('nav')
    .set({ padding: '10px 0' })
    .setColor(colorBlack, 'backgroundColor')
    .flexLayout({
        display: 'flex',
        justifyContent: 'space-around',
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
    .set({
        width: '20%',
    })
    .flexLayout({
        display: 'flex',
        justifyContent: 'space-between',
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
        border: '1px solid #000',
    })

nav.rule('button[type="submit"]')
   .setColor(
        colorBlack, 'color',
        colorYellow, 'backgroundColor',
       )
   .set({
       padding: '10px',
       border: '1px solid #000',
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

export default nav;
