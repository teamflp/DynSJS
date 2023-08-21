import { StyleSheet } from '../Classes/StyleSheet.js';
import { Color } from '../Classes/Color.js';

const header = new StyleSheet()

// Définition des couleurs
const colorBlue = new Color(125, 255, 0, 0.5);
const colorRed = new Color(255, 0, 0, 0.5);

// Supposons que cette fonction renvoie true pendant la journée et false la nuit.
/*function isNighttime() {
    const currentHour = new Date().getHours();
    return currentHour < 6 || currentHour > 18;
}*/

/*function isDaytime() {
    const currentHour = new Date().getHours();
    return currentHour >= 6 && currentHour <= 18;
}*/


header.rule('header')
    //.when(isNighttime)  // Utilisez la méthode 'when' pour appliquer la couleur en fonction de la condition.
    .setColor(colorRed, 'backgroundColor') // Cette règle ne sera appliquée que si isDaytime() retourne true.
    .nested('h1')
    .set({color: '#FFFFFF'});

export default header;
