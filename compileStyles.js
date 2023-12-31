/**
 * Ce fichier permet de compiler les styles CSS de votre composant.
 * Il est exécuté à chaque fois que vous lancez la commande `npm run build` ou `npm run build --watch'.
 */

import cssOutput from './src/demo.js'; // Importez votre fichier js
import fs from 'fs';

const outputPath = './dist/build/styles.css'; // Définissez le chemin vers le fichier css généré

try {
    fs.writeFileSync(outputPath, cssOutput);
    console.log(`Styles successfully written to ${outputPath}`);
} catch (error) {
    console.error(`Error writing to ${outputPath}:`, error);
}
