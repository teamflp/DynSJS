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
const isDarkThemeEnabled = () => {
    return true;
};

// Application des variables dans les styles
sheet.rule('body')
    .set({
        backgroundColor: '#1a1a1a',  // fond sombre pour le mode sombre
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        color: '#f4f4f4'  // texte clair pour le mode sombre
    })

sheet.rule('.content-wrapper')
    .set({
        border: '1px solid #ddd',
        borderRadius: '5px',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    })
    .nested('p')
    .set({
        marginBottom: '20px',
        lineHeight: '1.5'
    });

sheet.rule('h1')
    .set({
        color: '#007bff',
        fontSize: '24px'
    });

sheet.rule('.my-class')
    .set({
        color: '#007bff',
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
        backgroundColor: '#007bff',
        color: 'white',
        transition: 'background-color 0.3s',
        animation: 'buttonHover 0.3s forwards'
    });

sheet.rule('@keyframes buttonHover')
    .set({
        '0%': { 'background-color': '#007bff' },
        '100%': { 'background-color': 'rgb(0,83,215)' }
    });

sheet.rule('button:hover')
    .set({
        backgroundColor: 'rgb(0,83,215)',
        animation: 'none',
        color: 'white'
    });

// Media Query pour les écrans jusqu'à 768px

sheet.rule('body')
    .media('(max-width: 768px)')
    .set({ fontSize: '14px' });

// Media Query pour les écrans jusqu'à 576px
sheet.rule('body')
    .media('(max-width: 576px)')
    .set({ fontSize: '12px' });

// Media Query pour les écrans jusqu'à 480px
sheet.rule('body')
    .media('(max-width: 480px)')
    .set({ fontSize: '10px' });

const cssOutput = sheet.compile();

export default cssOutput;
