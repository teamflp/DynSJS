/**
 * This script compiles CSS using DynSJS and writes it to a file.
 * It should be adapted based on where your StyleSheet definition lives.
 * Run via Node.js: `node compileStyles.js`
 */

// Option 1: Import the compiled CSS string directly if index.js exports it
// import cssOutput from './index.js'; // Assuming index.js exports the compiled CSS

// Option 2: Import StyleSheet and compile here
import { StyleSheet } from './StyleSheet.js'; // Assuming StyleSheet.js is in the same directory
import { Color } from './Color.js'; // Import Color if needed for styles defined here

// Define your styles using the StyleSheet instance
const sheet = new StyleSheet();

// Example Style Definitions:
sheet.rule('body', 'html')
  .set({ margin: 0, padding: 0, boxSizing: 'border-box', fontFamily: '"Arial", sans-serif' });

sheet.rule('.container')
  .set({ width: '90%', maxWidth: '1200px', margin: '20px auto' });

const errorColor = Color.fromHex('#D32F2F');
sheet.rule('.error-message')
   .setColor(errorColor) // Use setColor helper
   .set({
       padding: '1em',
       border: `1px solid ${errorColor.operate('*', 0.8).toString()}`, // Use operate and toString
       backgroundColor: errorColor.operate('+', 200).operate('/', 1.2).toString(), // Example operation
       fontWeight: 'bold'
   });

sheet.rule('button.primary')
   .set({
       padding: '10px 20px',
       border: 'none',
       borderRadius: '4px',
       backgroundColor: '#007bff',
       color: '#ffffff',
       cursor: 'pointer',
       transition: 'background-color 0.2s ease'
   })
   .nested(':hover') // Nested pseudo-class
   .set({ backgroundColor: '#0056b3' });

// Media Query Example
sheet.rule('.container')
    .media('(max-width: 768px)') // Target smaller screens
    .set({ width: '95%' }); // Adjust width inside the media query

// --- End Style Definitions ---

// Compile the styles
const cssOutput = sheet.compile();

// --- File Writing ---
import fs from 'fs';
import path from 'path'; // Use path module for robust paths

const outputDir = './dist/build'; // Define output directory
const outputPath = path.join(outputDir, 'styles.css'); // Define the output file path

try {
    // Ensure the output directory exists
    fs.mkdirSync(outputDir, { recursive: true });
    // Write the file
    fs.writeFileSync(outputPath, cssOutput);
    console.log(`Styles successfully written to ${outputPath}`);
} catch (error) {
    console.error(`Error writing to ${outputPath}:`, error);
}