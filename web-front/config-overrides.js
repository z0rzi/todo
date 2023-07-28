const path = require('path');

const tsConfig = require('./tsconfig.json');

const paths = tsConfig.compilerOptions.paths;
const _paths = {
    "@/*": [ "*" ],
    "@utils/*": [ "utils/*" ]
};

const webpackPaths = {};

for (let [from, [to]] of Object.entries(_paths)) {
    if (from.endsWith('*')) from = from.slice(0, -1);
    if (to.endsWith('*')) to = to.slice(0, -1);
    if (from.endsWith('/')) from = from.slice(0, -1);
    if (to.endsWith('/')) to = to.slice(0, -1);

    if (!from) from = '.';
    if (!to) to = '.';

    webpackPaths[from] = to;
}

module.exports = function override(config, env) {
    config.module.rules = [
        ...config.module.rules,
        {
            resolve: {
                alias: webpackPaths,
            }
        }
    ];

    return config;
};
