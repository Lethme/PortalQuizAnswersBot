const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    target: 'node',
    externals: [nodeExternals()],
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {from: 'public', to: ''},
                {from: 'sessions.json', to: 'sessions.json'},
                {from: 'access.json', to: 'access.json'},
                {from: 'package.json', to: 'package.json'},
            ],
        }),
        new Dotenv({
            path: '.production.env'
        })
    ],
};