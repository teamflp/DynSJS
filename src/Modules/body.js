
import { StyleSheet } from '../Classes/StyleSheet.js';

const body = new StyleSheet();

// put your styles here.

body.rule('*, *::before, *::after')
    .set({
        boxSizing: 'border-box',
        outline: 'none',
    })

body.rule('body')
   .set({
       fontSize: '16px',
       fontFamily: 'sans-serif',
       lineHeight: '1.5',
       padding: '0',
       margin: '0',
   })

export default body;
