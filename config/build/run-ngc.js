var ngcBuild = require('./ngc-build');
var path = require('path');

ngcBuild.copyAndBuildTypescript({
    absolutePathSrcDir: path.normalize(path.join(process.cwd(), './src')),
    absolutePathDestDir: path.normalize(path.join(process.cwd(), './.ngc')),
    absolutePathTsConfig: path.normalize(path.join(process.cwd(), './tsconfig.json')),
    includeGlob: ['./app/ng-module.ts', './app/main.ts', './app/polyfills.ts'],
    pathToNgc: path.normalize(path.join(process.cwd(), './node_modules/.bin/ngc'))
}, function(err) {
    if (err) {
        throw err;
    }
    return;
});