var path = require('path');
var wwwPath = path.resolve(__dirname, 'www');
var outputPath = path.join(wwwPath, 'build', 'js');
var appPath = path.join(wwwPath, 'app');
var appJsPath = path.join(appPath, 'app.js');

module.exports = {
  entry: [
    "es6-shim",
    "zone.js",
    "reflect-metadata",
    "web-animations.min",
    // "./www/app/app.js"
    appJsPath
  ],
  output: {
    path: outputPath,
    filename: 'app.bundle.js'
    //pathinfo: true // show module paths in the bundle, handy for debugging
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "awesome-typescript-loader?doTypeCheck=false&useWebpackText=true",
        include: [wwwPath],
        // include: /www(\/|\\)app(\/|\\)/,
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        loader: "awesome-typescript-loader",
        // include: /www(\/|\\)app(\/|\\)/,
        include: [wwwPath],
        exclude: /node_modules/
       }
    ]
  },
  resolve: {
    modulesDirectories: [
      "node_modules",
      "node_modules/ionic-framework/node_modules", // angular is a dependency of ionic
      "node_modules/ionic-framework/dist/src/es5/common", // ionic-framework npm package (stable)
      "node_modules/ionic-framework/dist/js", // for web-animations polyfill

      // See README for steps on developing against ionic-framework locally
      // "dist/src/es5/common" // when developing against locally linked ionic-framework (master)
    ],
    extensions: ["", ".js", ".ts"]
  }
};

