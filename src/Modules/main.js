
import { StyleSheet } from '../Classes/StyleSheet.js';

const main = new StyleSheet();

// put your styles here.

main.rule('section')
    .nested('.container')
    .set({
        width: '80%',
        margin: '0 auto',
        padding: '10px 0',
    })
    .flexLayout({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
    })

main.rule('section')
    .nested('h1', 'h2')
        .set({
            fontWeight: '900',
            textAlign: 'center',
        })

main.rule('section p')
    .set({
        lineHeight: '1.5',
    })

main.rule('main')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
        .set({ padding: '10px 0'})
        .nested('h1', 'h2')
            .set({
                display: 'block',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
            })

main.rule('section')
    .media('(max-width: 768px)', '(max-width: 576px)', '(max-width: 480px)', '(max-width: 320px)')
    .nested('.container')
        .set({
            width: '100%',
            margin: '0',
            padding: '0 15px',
        })
        .flexLayout({
            display: 'flex',
            flexDirection: 'column',
        })

export default main;
