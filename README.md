## Librairie DynSJS : Dynamic StyleSheet JavaScript
DynSJS est une bibliothèque JavaScript innovante qui permet de créer des modules de styles CSS dynamiques et modulaires. Avec DynSJS, vous pouvez créer des modules de styles individuels, chacun contenant un ensemble de règles CSS, et ensuite les combiner pour créer une feuille de styles complète. Cela permet une organisation claire et modulaire de votre code CSS, facilitant la maintenance et la mise à jour de vos styles. En outre, DynSJS offre des fonctionnalités avancées telles que la gestion dynamique des media queries et des pseudo-classes, rendant votre code CSS plus puissant et flexible. En fin de compte, DynSJS compile tous vos modules en une seule feuille de styles, optimisant ainsi les performances de votre application.

### Dépendances

<div style="display: flex; justify-content: space-between; width: fit-content; gap: 5%">
    <a href="https://nodejs.org/en/">
        <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
    </a>
    <a href="">
        <img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white" alt="NPM">
    </a>
</div>


### Prérequis
- Connaissance de base de JavaScript
- Connaissance de base de CSS

### Installation
Pour installer DynSJS, exécutez la commande suivante dans votre terminal :
```bash
npm install dynsjs --save
```
## Les fonctionnalités de DynSJS
DynSJS est une bibliothèque JavaScript qui permet de générer dynamiquement des styles CSS. Elle offre une variété de fonctionnalités pour créer des styles de manière modulaire et organisée. Voici quelques-unes des fonctionnalités clés de DynSJS :

### Définition des propriétés CSS : ***La méthode set()*** 
En utilisant la méthode ***set()***, vous pouvez définir les propriétés CSS de votre choix. La méthode ***set()*** prend deux paramètres : le premier paramètre est le nom de la propriété CSS, et le deuxième paramètre est la valeur de la propriété CSS. Vous pouvez également définir plusieurs propriétés CSS en une seule fois en passant un objet comme paramètre à la méthode ***set()***. Voici quelques exemples :
```javascript
article.rule('article')
    .set({ width: '100%' })
````
### Sélecteurs enfants : ***La méthode nested()***
En utilisant la méthode ***nested()***, vous pouvez définir des sélecteurs enfants. La méthode ***nested()*** prend deux paramètres : le premier paramètre est le nom du sélecteur enfant, et le deuxième paramètre est une fonction qui contient les règles CSS du sélecteur enfant. Voici un exemple :
```javascript
article.rule('article')
    .nested('h1')
        .set({ color: 'blue' });
```
### Media query : ***La méthode media()***
En utilisant la méthode ***media()***, vous pouvez définir des media queries. La méthode ***media()*** prend deux paramètres : le premier paramètre est le nom du media query, et le deuxième paramètre est une fonction qui contient les règles CSS du media query. Voici un exemple :
```javascript
article.rule('article')
    .media('max-width: 600px')
        .set({ width: '100%', padding: '20px 20px' });
```
### Conditions : ***La méthode when()***
En utilisant la méthode ***when()***, vous pouvez définir des conditions. La méthode ***when()*** prend 1 paramètre : le nom de la condition. Voici un exemple :
- Option 1 :
```javascript
// Supposons que cette fonction renvoie true pendant la journée et false la nuit.
function isNighttime() {
    const currentHour = new Date().getHours();
    return currentHour < 6 || currentHour > 18;
}

article.rule('article')
    .when(isNighttime) // On applique la couleur en fonction de la condition.
        .set({ backgroundColor: 'black', color: 'white' });
```
- Option 2 :

```javascript
article.rule('article')
    .when(true) // Si la condition est vraie, on applique la couleur aux sélecteurs enfants h3 et h1
    .nested('h1', 'h3')
        .set({ color: 'red' });
```
### Couleurs : ***La méthode setColor()***
En utilisant la méthode ***setColor()***, vous pouvez définir des couleurs. La méthode ***setColor()*** prend 2 paramètres : le premier paramètre est le nom de la couleur, et le deuxième paramètre est le type de couleur. Voici un exemple :

Vous pouvez définir vos variables de couleurs dans un module ***colors.js*** ou directement dans votre module :

```javascript
const colorBlack = new Color('rgba(0,0,0,255)');
const colorWhite = new Color('rgba(255,255,255,255)');

article.rule('article')
    .setColor(colorBlack, 'backgroundColor')
    .setColor(colorWhite, 'color');
```
### Texte pour les pseudo-éléments : ***La méthode setText()***
En utilisant la méthode ***setText()***, vous pouvez définir du texte pour les pseudo-éléments ::before et ::after. La méthode ***setText()*** prend 1 paramètre : le texte. Voici un exemple :
```javascript
article.rule('article')
    .setText('Hello World');
```
### Propriétés flexbox : ***La méthode flexLayout()*** et ***La méthode flexItem()***
En utilisant les méthodes ***flexLayout()*** et ***flexItem()***, vous pouvez définir des propriétés flexbox. Voici un exemple :
- Méthode flexLayout() :
```javascript
article.rule('article')
    .flexLayout({ display: 'flex', direction: 'row', align: 'center' });
```
- Méthode flexItem() :
```javascript
article.rule('article')
    .flexItem({ flex: '1 1 auto' });
```
### Transitions : ***La méthode setTransition()***
En utilisant la méthode ***setTransition()***, vous pouvez définir des transitions. La méthode ***setTransition()*** prend un seul argument. Cet argument peut être soit une chaîne de caractères représentant la propriété de transition CSS, soit un objet contenant les propriétés de transition. Voici un exemple :

- Option 1 : setTransition - paramètres en tant que Chaîne de caractères
```javascript
article.rule('article')
    .nested('button:hover')
        .setColor(colorOrange, 'backgroundColor')
        .setTransition('all 0.5s ease-in-out');
```

- Option 2 : setTransition - paramètres en tant qu'Objet
```javascript
article.rule('article')
    .nested('button:hover')
        .setColor(colorOrange, 'backgroundColor')
        .setTransition({ 
            property: 'all', 
            duration: '0.5s', 
            timingFunction: 'ease-in-out' 
        });
```
### Les mixins dynamiques : ***La méthode mixin()***
En utilisant la méthode ***mixin()***, vous pouvez définir des mixins dynamiques. La méthode ***mixin()***. Voici un exemple :
```javascript
export function mixins(stylesheet) {
    stylesheet.generateClasses({
        prefix: 'texte',
        count: 6,
        properties: {
            fontSize: '1.2em',
        }
    });
}

CSS généré :

.text-1 { font-size: 1.2em; }
.text-2 { font-size: 2.4em; }
.text-3 { font-size: 3.5999999999999996em; }
.text-4 { font-size: 4.8em; }
.text-5 { font-size: 6em; }
.text-6 { font-size: 7.199999999999999em; }
```

### Animation : ***La méthode setAnimation()*** 
En utilisant la méthode ***setAnimation()***, vous pouvez définir des animations. La méthode ***setAnimation()*** prend un seul paramètre, qui peut être de type string ou object. Voici un exemple :
- Option 1 : setAnimation - paramètres en tant que Chaîne de caractères
```javascript
article.rule('@keyframes slideIn')
    .set({ 
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' }
    });

article.rule('button')
    .setAnimation('slideIn 0.5s ease-in-out');
```
- Option 2 : setAnimation - paramètres en tant qu'Objet
```javascript
article.rule('@keyframes slideIn')
    .set({ 
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' }
    });

article.rule('button')
    .setAnimation({ 
        name: 'slideIn', 
        duration: '0.5s', 
        timingFunction: 'ease-in-out' 
    });
```

### Grid : ***La méthode gridLayout()***
En utilisant la méthode ***gridLayout()***, vous pouvez définir des propriétés grid. La méthode ***gridLayout()*** prend un seul paramètre, qui peut être de type string ou object. Voici un exemple :

- Option 1 : gridLayout - paramètres en tant que Chaîne de caractères
```javascript
article.rule('article')
    .gridLayout('1fr 1fr 1fr / 1fr 1fr 1fr');
```
- Option 2 : gridLayout - paramètres en tant qu'Objet
```javascript
article.rule('article')
    .gridLayout({ 
        template: '1fr 1fr 1fr / 1fr 1fr 1fr', 
        gap: '10px' 
    });
```

### Les pseudo-classes : ***La méthode setPseudo()***
En utilisant la méthode ***setPseudo()***, vous pouvez définir des pseudo-classes. La méthode ***setPseudo()*** prend un seul paramètre, qui peut être de type string ou object. Voici un exemple :

- Option 1 : setPseudo - paramètres en tant que Chaîne de caractères
```javascript
article.rule('article')
    .setPseudo('hover', { 
        color: 'red', 
        backgroundColor: 'blue' 
    });
```

- Option 2 : setPseudo - paramètres en tant qu'Objet
```javascript
article.rule('article')
    .setPseudo({ 
        pseudo: 'hover', 
        properties: { 
            color: 'red', 
            backgroundColor: 'blue' 
        } 
    });
```


Ces fonctionnalités permettent de créer des styles CSS de manière modulaire et organisée, facilitant la maintenance et la mise à jour de votre code.

-----------------------------------------------------------------------------
## Utilisation de la bibliothèque DynSJS
Exécutez la commande suivante pour compiler : 
```bash
npm run build:dev
```
La commande ***npm run build:dev*** va générer un fichier styles.css dans le dossier ***dist/build/***

Importez le fichier ***styles.css*** dans votre fichier HTML selon l'architecture de votre projet :
```html
<link rel="stylesheet" href="your_file_path/styles.css">
```
### Créez un nouveau module avec la commande suivante :
```javascript
npm run new:module article
```
La commande ***npm run new:module*** va générer un fichier ***article.js*** dans le dossier ***src/modules/***

### Créez votre première règle dans le fichier ***article.js*** : 
```javascript
article.rule('article')
    .setColor(colorBlack, 'backgroundColor')
    .set({ padding: '20px 20px' })
    .flexLayout({ display: 'flex', direction: 'row', align: 'center' });
```
### Dans votre terminal, exécutez la commande suivante pour compiler :
```bash
npm run build:dev
```
Cela va générer le code CSS suivant dans le fichier ***styles.css***
```css
article { 
    background-color: rgba(0,0,0,255); 
    padding: 20px 20px; 
    display: flex; 
    flex-direction: row; 
    align-items: center; 
}
```

-----------------------------------------------------------------------------
