
import { StyleSheet } from '../Classes/StyleSheet.js';
import {colorBlack} from "./vars.js";
import nav from "./nav.js";

const footer = new StyleSheet();

// put your styles here.

footer.rule('footer')
    .set({ padding: '15px 0' })
    .setColor(colorBlack, 'backgroundColor')

footer.rule('footer')
    .nested('.container-footer')
        .set({
            width: '80%',
            margin: '0 auto',
            padding: '10px 0',
        })
       .flexLayout({
           display: 'flex',
           justifyContent: 'space-between',
           alignItems: 'center',
           flexWrap: 'nowrap',
       })

footer.rule('footer .container-footer h3')
    .set({
        color: 'yellow',
        padding: '0 10px',
        fontSize: '1.2em',
    })

footer.rule('footer .container-footer a:hover')
    .set({
        color: '#fff',
        textDecoration: 'underline',
    })

footer.rule('footer .container-footer .footer-item p')
    .set({
        color: '#fff',
        padding: '0 10px',
    })

footer.rule('footer .container-footer .footer-item')
    .set({
        width: '50%',
        //border: '1px solid #fff',
    })

// media queries

footer.rule('footer')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .set({ padding: '0' })

footer.rule('footer .container-footer')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .set({
            width: '100%',
            margin: '0',
            padding: '0 10px',
        })
        .flexLayout({
            display: 'flex',
            flexDirection: 'column',
        })

footer.rule('footer .container-footer')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .nested('.footer-item')
           .set({
                width: '100%',
                margin: '10px 0',
            })



export default footer;
