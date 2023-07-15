/* eslint-disable @typescript-eslint/no-require-imports */
const webpack = require('webpack');

module.exports = function override(config, env) {
    config.resolve.fallback = {
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer')
    };
    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ]);
    return config;
};
