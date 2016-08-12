'use strict';

var webpack = require('webpack');

var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common');


var path = require('path');

/**
 * Webpack Plugins
 */
var DefinePlugin = require('webpack/lib/DefinePlugin');

/**
 * Webpack Constants
 */
var ENV = process.env.ENV = process.env.NODE_ENV = 'development';
var METADATA = webpackMerge(commonConfig.metadata, {
  host: 'localhost',
  port: 3000,
  ENV: ENV
});

module.exports = webpackMerge(commonConfig, {

  debug: false,

  devtool: 'source-map',

  output: {
    path: path.join(__dirname, '../www/build/js'),
    filename: '[name].bundle.js',
    sourceMapFilename: '[name].bundle.map',
    chunkFilename: '[id].chunk.js'
  },

  plugins: [
    new DefinePlugin({
      'ENV': JSON.stringify(METADATA.ENV),
      'process.env': {
        'ENV': JSON.stringify(METADATA.ENV),
        'NODE_ENV': JSON.stringify(METADATA.ENV),
      }
    })
  ]
});
