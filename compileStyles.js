import cssOutput from './src/demo.js'; // Importez le fichier js
import fs from 'fs';

const outputPath = './dist/build/styles.css'; // Définit le chemin vers le fichier css généré

try {
    fs.writeFileSync(outputPath, cssOutput);
    console.log(`Styles successfully written to ${outputPath}`);
} catch (error) {
    console.error(`Error writing to ${outputPath}:`, error);
}
