const { DefinePlugin } = require('webpack');
const tsConfig = require('./tsconfig.json');

const paths = tsConfig.compilerOptions.paths;

const webpackPaths = {};

for (let [from, [to]] of Object.entries(paths)) {
    if (from.endsWith('*')) from = from.slice(0, -1);
    if (to.endsWith('*')) to = to.slice(0, -1);
    if (from.endsWith('/')) from = from.slice(0, -1);
    if (to.endsWith('/')) to = to.slice(0, -1);

    if (!from) from = '.';
    if (!to) to = '.';

    webpackPaths[from] = to;
}

const node_env = process.env['REACT_APP_ENV'] || process.env['NODE_ENV'];

console.log('REACT_APP_ENV = %s', process.env['REACT_APP_ENV']);

module.exports = function override(config, env) {
    config.module.rules = [
        ...config.module.rules,
        {
            resolve: {
                alias: webpackPaths,
            }
        },
    ];

    config.plugins = [
        ...config.plugins,
        new DefinePlugin({
            'ENV': `"${node_env}"`,
        }),
    ]

    return config;
};
