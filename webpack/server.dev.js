const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const WriteFilePlugin = require('write-file-webpack-plugin')

const res = p => path.resolve(__dirname, p)

const nodeModules = res('../node_modules')
const entry = res('../server/render.js')
const output = res('../buildServer')

// if you're specifying externals to leave unbundled, you need to tell Webpack
// to still bundle `react-universal-component`, `webpack-flush-chunks` and
// `require-universal-module` so that they know they are running
// within Webpack and can properly make connections to client modules:
const externals = fs
    .readdirSync(nodeModules)
    .filter(x => !/\.bin|react-universal-component|webpack-flush-chunks/.test(x))
    .reduce((externals, mod) => {
        externals[mod] = `commonjs ${mod}`
        return externals
    }, {})

externals['react-dom/server'] = 'commonjs react-dom/server'

module.exports = {
    name: 'server',
    target: 'node',
    // devtool: 'source-map',
    devtool: 'eval',
    entry: [entry],
    externals,
    output: {
        path: output,
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'css-loader/locals',
                        options: {
                            modules: true,
                            localIdentName: '[path][name]__[local]--[hash:base64:5]'
                        }
                    },
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.css',]
    },
    plugins: [
        new WriteFilePlugin(),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        }),

        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        })
    ]
}