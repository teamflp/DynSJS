// vars.js
import { ColorManager } from '../Classes/ColorManager.js';

// RGB
export const colorRGBRed = new ColorManager(255, 0, 0);
export const colorRGBGreen = new ColorManager(0, 255, 0);
export const colorRGBYellow = new ColorManager(255, 255, 0);
// RGBA
export const colorRed = new ColorManager(255, 0, 0, 0.5);
export const colorGreen = new ColorManager(0, 255, 0, 0.5);
export const colorYellow = new ColorManager(255, 255, 0, 255);
export const colorBlue = new ColorManager(0, 0, 255, 0.5);
export const colorWhite = new ColorManager(255, 255, 255, 255);
export const colorBlack = new ColorManager(0, 0, 0, 255);
export const colorGrey = new ColorManager(128, 128, 128, 0.5);
export const colorOrange = new ColorManager(255, 165, 0, 0.5);
export const colorDark = new ColorManager(0, 0, 0, 0.10);

// HEX
export const colorHexRed = new ColorManager('#ff0000');
export const colorHexGreen = new ColorManager('#00ff00');
export const colorHexYellow = new ColorManager('#ffff00');

// HSL
export const colorHSLRed = new ColorManager('hsl(0, 100%, 50%)');
export const colorHSLGreen = new ColorManager('hsl(120, 100%, 50%)');
export const colorHSLYellow = new ColorManager('hsl(60, 100%, 50%)');

// HSLA
export const colorHSLARed = new ColorManager('hsla(0, 100%, 50%, 0.5)');
export const colorHSLAGreen = new ColorManager('hsla(120, 100%, 50%, 0.5)');
export const colorHSLAYellow = new ColorManager('hsla(60, 100%, 50%, 0.5)');
