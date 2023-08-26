import { StyleSheet } from './Classes/StyleSheet.js';
import body from "./Modules/body.js";
import header from './Modules/header.js';
import article from "./Modules/article.js";
import footer from './Modules/footer.js';

const MainSheet = new StyleSheet();

MainSheet.combine(
    body,
    header,
    article,
    footer,
);

const cssOutput = MainSheet.compile();
export default cssOutput;
