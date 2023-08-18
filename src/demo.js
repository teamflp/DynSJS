import { StyleSheet } from './StyleSheet.js';

const sheet = new StyleSheet();

// Styles par défaut
sheet.rule('body')
    .set({
        backgroundColor: '#f4f4f4',
        fontFamily: 'Arial, sans-serif',
        padding: '20px'
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
        color: '#333',
        fontSize: '24px'
    });

sheet.rule('.my-class')
    .set({
        color: '#555',
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
        backgroundColor: '#007BFF',
        color: 'white'
    })
    .media('(max-width: 600px)')
    .set({
        fontSize: '14px'
    });

// Appliquer les styles initiaux
const cssOutput = sheet.compile();
document.head.insertAdjacentHTML('beforeend', `<style>${cssOutput}</style>`);

// Événement pour changer de thème
document.getElementById('toggleTheme').addEventListener('click', () => {
    const isDark = document.body.style.backgroundColor === 'black';

    if (isDark) {
        sheet.rule('body').set({backgroundColor: '#f4f4f4'});
        sheet.rule('h1').set({color: '#333'});
        sheet.rule('.my-class').set({color: '#555'});
    } else {
        sheet.rule('body').set({backgroundColor: 'black'});
        sheet.rule('h1').set({color: 'white'});
        sheet.rule('.my-class').set({color: '#aaa'});
    }

    // Mise à jour des styles
    const updatedCSS = sheet.compile();
    document.head.insertAdjacentHTML('beforeend', `<style>${updatedCSS}</style>`);
});
