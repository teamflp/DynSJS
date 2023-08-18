const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: './src/DynSJS.js',
    output: {
        filename: 'dynsjs.bundle.js',
        path: path.resolve(__dirname, 'dist/build'), // Le chemin vers le dossier de sortie, par exemple './dist' à modifier selon votre projet
    },
    devtool: 'source-map', // Permet de générer les sources maps pour le débogage
    mode: 'development', // 'production' pour un build optimisé
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    }
};
