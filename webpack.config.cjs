const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const JSDocPlugin = require('jsdoc-webpack-plugin');

module.exports = {
    entry: './src/DynSJS.js',
    output: {
        filename: 'dynsjs.bundle.js',
        path: path.resolve(__dirname, 'dist/build'),
    },
    devtool: 'source-map',
    mode: 'development',
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
    },
    plugins: [
        new JSDocPlugin({
            conf: './jsdoc.json',
        })
    ]
};
