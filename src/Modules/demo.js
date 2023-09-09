import { StyleSheet } from '../Classes/StyleSheet.js';
import { ColorManager } from '../Classes/ColorManager.js';

const sheet = new StyleSheet();

// Créez des instances de la classe ColorManager
const primaryColor = new ColorManager(255, 255, 125);  // 2. Créez des instances de ColorManager
const hoverColor = new ColorManager(100, 83, 125);

sheet.rule('body')
    .set({
        backgroundColor: '#1a1a1a',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        color: '#f4f4f4'
    })

sheet.rule('h1')
    .setColor(primaryColor, 'color')  // 3. Utilisez setColor
    .set({ fontSize: '24px' });

sheet.rule('.my-class')
    .setColor(primaryColor, 'color')  // 3. Utilisez setColor
    .set({ fontSize: '16px' });

sheet.rule('button')
    .setColor(primaryColor, 'backgroundColor')  // 3. Utilisez setColor
    .set({
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        marginTop: '20px',
        border: 'none',
        borderRadius: '5px',
        color: 'white',
        transition: 'background-color 0.3s',
        animation: 'buttonHover 0.3s forwards',
    });

sheet.rule('@keyframes buttonHover')
    .set({
        '0%': { 'background-color': primaryColor.toRGBA() },
        '100%': { 'background-color': hoverColor.toRGBA() },
    });

sheet.rule('button:hover')
    .setColor(hoverColor, 'backgroundColor')  // 3. Utilisez setColor
    .set({
        animation: 'transition 0.3s ease-in-out forwards',
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
export default sheet
