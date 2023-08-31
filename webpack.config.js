const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");
const JSDocPlugin = require('jsdoc-webpack-plugin');

module.exports = {
    entry: './src/index.js',
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
    ],
    resolve: {
        fallback: {
            util: require.resolve("util/"),
            net: require.resolve("stream"),
            tls: require.resolve("tls"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            fs: false, // You might need to adjust your code to avoid using 'fs'
            crypto: require.resolve("crypto-browserify"),
            buffer: require.resolve("buffer/"),
        },
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            extractComments: false,
        })],
    },
};
