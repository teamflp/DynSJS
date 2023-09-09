import { StyleSheet } from '../Classes/StyleSheet.js';
import {mixins} from "./mixins.js";

const body = new StyleSheet();


body.rule('*, *::before, *::after')
    .set({ boxSizing: 'border-box' })
mixins(body);

body.rule('body')
    .set({
        fontFamily: 'Arial, sans-serif',
        padding: '0',
        margin: '0 auto',
        fontSize: '16px'
    })


export default body;
