var rollup = require('rollup').rollup;
var commonjs = require('rollup-plugin-commonjs');
var nodeResolve = require('rollup-plugin-node-resolve');
var componentSass = require('@ionic/component-sass').componentSass;


function rollupNG2() {
  return {
    resolveId(id) {
      if (id.startsWith('rxjs/')) {
        return process.cwd() + '/node_modules/rxjs-es/' + id.split('rxjs/').pop() + '.js';
      }
    }
  };
}


var appOptions = {
  entry: '.ngc/app/main.js',
  sourceMap: true,
  plugins: [
    rollupNG2(),
    nodeResolve()
  ]
};

rollup(appOptions).then(function(bundle) {

  bundle.write({
    format: 'iife',
    dest: 'www/build/bundle.es6.js'
  });

  var modulePaths = bundle.modules.map(function(m) { return m.id; });
  var componentSassOptions = {
    /**
     * "includePaths" is used by node-sass for additional
     * paths to search for sass imports by just name.
     */
    includePaths: [
      'node_modules/ionic-angular/themes',
      'node_modules/ionicons/dist/scss'
    ],

    /**
     * Compiled modules may be within a different directory
     * than its source file and sibling component sass files.
     */
    directoryMaps: {
      '.ngc': 'src'
    },

    /**
     * "componentSassFiles" is a glob to search for sass
     * files in the same directory as the component module.
     */
    componentSassFiles: [
      '*.scss'
    ],

    /**
     * "variableSassFiles" lists out the files which include
     * only sass variables. These variables are the first sass files
     * to be imported so their values override default variables.
     */
    variableSassFiles: [
      'src/theme/variables.scss'
    ],

    /**
     * "excludeModules" is used just as a way to skip over
     * modules which we know wouldn't have any sass to be
     * bundled. "excludeModules" isn't necessary, but is a
     * good way to speed up build times by skipping modules.
     */
    excludeModules: [
      '@angular',
      'core-js',
      'html-webpack-plugin',
      'ionic-native',
      'lodash',
      'process',
      'rxjs',
      'webpack',
      'zone.js'
    ],

    /**
     * "outFile" where the final CSS file will be saved by node-sass.
     */
    outFile: 'www/build/main.css',

    /**
     * "sourceMap" if a source map should be built or not.
     */
    sourceMap: true,

    /**
     * "outputStyle" how node-sass should output the css file.
     */
    outputStyle: 'compressed',

    /**
     * "autoprefixer" is the config options for autoprefixer.
     * Excluding this config will skip using autoprefixer.
     */
    // autoprefixer: {
    //   browsers: [
    //     'last 2 versions',
    //     'iOS >= 8',
    //     'Android >= 4.4',
    //     'Explorer >= 11',
    //     'ExplorerMobile >= 11'
    //   ],
    //   cascade: false
    // }
  };
  componentSass(modulePaths, componentSassOptions);

}, console.error);


var polyfillOptions = {
  entry: '.ngc/app/polyfills.js',
  sourceMap: true,
  plugins: [
    commonjs({}),
    nodeResolve()
  ]
};
rollup(polyfillOptions).then(function(bundle) {
  bundle.write({
    format: 'iife',
    dest: 'www/build/polyfills.js'
  });
}, console.error)