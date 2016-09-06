
/**
 * Ionic Webpack2 Config
 * Adapted from @AngularClass https://github.com/AngularClass
 * MIT License
 */

const webpack = require('webpack');
//const helpers = require('../helpers');
const CompressionPlugin = require('compression-webpack-plugin');

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ComponentSassPlugin = require('../component-sass/index');

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = {
  debug: false,
  devtool: 'source-map',

  /*
   * Cache generated modules and chunks to improve performance for multiple incremental builds.
   * This is enabled by default in watch mode.
   * You can pass false to disable it.
   *
   * See: http://webpack.github.io/docs/configuration.html#cache
   */
   //cache: false,

  /*
   * The entry point for the bundle
   * Our Angular.js app
   *
   * See: http://webpack.github.io/docs/configuration.html#entry
   */
  entry: {
    'polyfills': './.ngc/app/polyfills.js',
    'main':      './.ngc/app/main.js'
  },

  debug: true,

  devtool: 'source-map',

  output: {
    path: './www/build',
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].bundle.map',
    chunkFilename: '[id].chunk.js'
  },

  /*
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {

    /*
     * An array of extensions that should be used to resolve modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['', '.js', '.json'],

    // Make sure root is src
    //root: helpers.root('src'),

    // remove other default values
    modulesDirectories: ['node_modules'],

    mainFields: ['module', 'main', 'browser'],
  },

  /*
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {

    /*
     * An array of automatically applied loaders.
     *
     * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
     * This means they are not resolved relative to the configuration file.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-loaders
     */
    loaders: []

  },

  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [

    /*
     * Plugin: ComponentSassPlugin
     */
    new ComponentSassPlugin({
      /**
       * "includePaths" is used by node-sass for additional
       * paths to search for sass imports by just name.
       */
      includePaths: [
        'src',
        'node_modules/ionic-angular/themes',
        'node_modules/ionicons/dist/scss'
      ],

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
       * modules which we know wouldn't have any sass we
       * care to bundle. "excludeModules" isn't necessary, but
       * is a good way to speed up build times by skipping modules.
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
      autoprefixer: {
        browsers: [
          'last 2 versions',
          'iOS >= 8',
          'Android >= 4.4',
          'Explorer >= 11',
          'ExplorerMobile >= 11'
        ],
        cascade: false
      }
    }),

    /*
     * Plugin: CommonsChunkPlugin
     * Description: Shares common code between the pages.
     * It identifies common modules and put them into a commons chunk.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
     * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
     */
    new webpack.optimize.CommonsChunkPlugin({
      name: ['polyfills', 'main'].reverse()
    }),

    /*
     * Plugin: CopyWebpackPlugin
     * Description: Copy files and directories in webpack.
     *
     * Copies project static assets.
     *
     * See: https://www.npmjs.com/package/copy-webpack-plugin
     */
    new CopyWebpackPlugin([{
      from: 'src/assets',
      to: '../assets'
    }]),

    /*
     * Plugin: HtmlWebpackPlugin
     * Description: Simplifies creation of HTML files to serve your webpack bundles.
     * This is especially useful for webpack bundles that include a hash in the filename
     * which changes every compilation.
     *
     * See: https://github.com/ampedandwired/html-webpack-plugin
     */
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      filename: '../index.html',
      chunksSortMode: 'dependency'
    }),

		new CompressionPlugin({
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.js$|\.html$/,
			threshold: 10240,
			minRatio: 0.8
		})
  ],

  /*
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: 'window',
    crypto: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

};
