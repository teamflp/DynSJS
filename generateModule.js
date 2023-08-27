import fs from 'fs';
import path from 'path';

const moduleName = process.argv[2];
if (!moduleName) {
    console.error('Veuillez fournir un nom de module.');
    process.exit(1);
}

const modulePath = path.join(process.cwd(), 'src', 'Modules', `${moduleName}.js`);
const indexPath = path.join(process.cwd(), 'src', 'index.js');

// Générer le module
const moduleContent = `
import { StyleSheet } from '../Classes/StyleSheet.js';

const ${moduleName} = new StyleSheet();

// put your styles here.

export default ${moduleName};
`;

try {
    fs.writeFileSync(modulePath, moduleContent);
} catch (error) {
    console.error(`Erreur lors de l'écriture du fichier ${modulePath}:`, error);
    process.exit(1);
}

try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const importLine = `import ${moduleName} from './Modules/${moduleName}.js';`;
    const updatedContent = indexContent.replace(
        'const MainSheet = new StyleSheet();',
        `${importLine}\n\nconst MainSheet = new StyleSheet();`
    ).replace(
        'MainSheet.combine(',
        `MainSheet.combine(\n    ${moduleName},`
    );

    fs.writeFileSync(indexPath, updatedContent);
} catch (error) {
    console.error(`Erreur lors de la mise à jour du fichier ${indexPath}:`, error);
    process.exit(1);
}

console.log(`Module ${moduleName} créé avec succès.`);
