'use strict';

var webpack = require('webpack');

var webpackMerge = require('webpack-merge');
var commonConfig = require('./webpack.common');
var CompressionPlugin = require('compression-webpack-plugin');

var path = require('path');

module.exports = webpackMerge(commonConfig, {

  debug: false,

  devtool: 'source-map',

  output: {
    path: path.join(__dirname, '../www/build/js'),
    filename: '[name].bundle.min.js',
    sourceMapFilename: '[name].bundle.min.map',
    chunkFilename: '[id].chunk.min.js'
  },

  plugins: [
		new webpack.optimize.UglifyJsPlugin({
			beautify: false, //prod
			mangle: { screw_ie8 : true }, //prod
			compress: { screw_ie8: true }, //prod
			comments: false //prod
    }),

		new CompressionPlugin({
			asset: '[path].gz[query]',
			algorithm: 'gzip',
			test: /\.js$|\.html$/,
			threshold: 10240,
			minRatio: 0.8
		})
  ]
});
