import { StyleSheet } from './StyleSheet.js';

const sheet = new StyleSheet();

// Définition des variables de couleur au niveau de la racine
/*sheet.rule(':root')
    .set({
        '--primary-color': 'rgb(0,123,255)',
        '--text-color': 'rgb(51,51,51)',
        '--background-color': 'rgb(244,244,244)'
    });*/

// Application des variables dans les styles
sheet.rule('body')
    .set({
        backgroundColor: 'var(--background-color)',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        color: 'var(--text-color)'
    });

sheet.rule('.content-wrapper')
    .set({
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    });

sheet.rule('h1')
    .set({
        color: 'var(--text-color)',
        fontSize: '24px'
    });

sheet.rule('.my-class')
    .set({
        color: 'var(--text-color)',
        fontSize: '16px'
    });

sheet.rule('button')
    .set({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '20px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: 'var(--primary-color)',
        color: 'white',
        transition: 'background-color 0.3s',
        animation: 'buttonHover 0.3s forwards'
    });

sheet.rule('@keyframes buttonHover')
    .set({
        '0%': 'background-color: var(--primary-color)',
        '100%': 'background-color: rgb(0,83,215)'
    });

const cssOutput = sheet.compile();

export default cssOutput;
