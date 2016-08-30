var webpack = require('webpack');
var path = require('path');
var autoprefixer = require('autoprefixer');

/*
 * Webpack Plugins
 */
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

module.exports = {
  entry: {
    app: path.join(__dirname, '/../../dist/tmp/ngc/app/entry-point.ts'),
    polyfills: path.join(__dirname, '/../../dist/tmp/ngc/app/polyfills.ts')
  },

  resolve: {
    mainFields: ['main', 'browser'],
    aliasFields: ['browser'],
    extensions: ['', '.js', '.ts', '.json', '.scss'],
    modulesDirectories: ['node_modules']
  },

  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts',
        query: {
          configFileName: 'tsconfig.json'
        }
      },
      /*{
        test: /\.ts$/,
        loaders: ['./loaders/glob?{files:["./[name].scss","./[name].md.scss","./[name].ios.scss"]}', 'awesome-typescript-loader'],
        exclude: [/\.(spec|e2e)\.ts$/],
      },*/
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          notExtractLoader: 'style-loader',
          loader: 'css-loader?sourceMap!postcss-loader?sourceMap!resolve-url!sass-loader?sourceMap'
        })
      },
      {
        test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader : 'file-loader?config=fontLoader'
      },
      {
        test   : /\.(jpe?g|png|gif)(\?[a-z0-9=&.]+)?$/,
        loader : 'file-loader?config=imgLoader'
      }
    ]
  },

  plugins: [
    new ForkCheckerPlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      name: ['polyfills', 'app'].reverse(),
      minChunks: Infinity
    }),

    new CopyWebpackPlugin([{
      from: 'app/assets',
      to: 'assets'
    }]),

    new ExtractTextPlugin('../css/app.md.css')
  ],

  postcss: [
    autoprefixer({
      browsers: [
        'last 2 versions',
        'iOS >= 7',
        'Android >= 4',
        'Explorer >= 10',
        'ExplorerMobile >= 11'
      ],
      cascade: false
    })
  ],

  sassLoader: {
    includePaths: [
      'node_modules/ionic-angular/',
      'node_modules/ionicons/dist/scss/'
    ]
  },

  fontLoader: {
    name: '../fonts/[name]-[hash].[ext]'
  },

  imgLoader: {
    name: '../images/[name]-[hash].[ext]'
  },

  node: {
    global: 'window',
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }
};
