import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cssOutput from './src/index.js';

const stylesPath = path.resolve(__dirname, 'dist', 'build', 'styles.css');

try {
    fs.writeFileSync(stylesPath, cssOutput);
    console.log(`Styles successfully written`);
} catch (error) {
    console.error(`Error writing to ${stylesPath}:`, error);
}
