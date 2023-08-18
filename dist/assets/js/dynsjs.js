const sheet = new StyleSheet();

// Simple règle
sheet.rule('.myClass')
    .set({
        'background-color': 'red',
        'color': 'white'
    });

// Règle avec sélecteurs imbriqués
sheet.rule('.container')
    .set({ 'padding': '10px' })
    .nested('.child')
    .set({ 'margin': '5px' });

// Règle avec une requête média
sheet.rule('.responsive')
    .set({ 'font-size': '16px' })
    .media('(max-width: 768px)')
    .set({ 'font-size': '12px' });

// Règle conditionnelle
const isDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

sheet.rule('body')
    .when(isDarkMode)
    .set({ 'background-color': 'black', 'color': 'white' });

sheet.apply();
