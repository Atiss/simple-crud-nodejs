// Generated using webpack-cli https://github.com/webpack/webpack-cli

import path from "node:path";

const isProduction = process.env.NODE_ENV === 'production';


const config = {
    target: 'node',
    entry: './src/index.js',
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'index.js',
        module: true,
    },
    experiments: {
        outputModule: true,
    },
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'source-map',
};

export default config;
