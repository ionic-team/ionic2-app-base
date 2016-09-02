var gulp = require('gulp');
var gulpWatch = require('gulp-watch');
var del = require('del');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var webpackConfig = require('./config/webpack/webpack.config.js');
var argv = process.argv;

/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 *
 * Using these will allow you to stay up to date if the default Ionic 2 build
 * changes, but you are of course welcome (and encouraged) to customize your
 * build however you see fit.
 */
var isRelease = false;
if (argv.indexOf('--release') > -1) {
  isRelease = true;
  process.env.NODE_ENV = 'production';
}
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;

var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var tslint = require('ionic-gulp-tslint');

//var serviceWorker = require('ionic-gulp-service-worker');

gulp.task('lint', tslint);
gulp.task('clean', function(){
  return del(['www/build', 'dist']);
});

/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
//gulp.task('serve:before', ['watch']);
gulp.task('serve:before', ['build', 'worker']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

/*
 *
 */


var isRelease = argv.indexOf('--release') > -1;

gulp.task('watch', ['clean'], function(done){
  var compiler = webpack(webpackConfig);

  compiler.watch({
    aggregateTimeout: 300
  }, function(err, stats) {
    if (err) {
      console.log('webpack', stats.toString({}));
    }
    done();
  });
});

gulp.task('bundle-js', function(done) {
  //runSequence('copy-src', 'run-ngc', 'webpack', /*'delete-tmp',*/ done);
  var ngcBuild = require('ionic-ngc-build');
  var path = require('path');
  ngcBuild.copyAndBuildTypescript({
    absolutePathSrcDir: path.normalize(path.join(process.cwd(), './src')),
    absolutePathDestDir: path.normalize(path.join(process.cwd(), './.ngc')),
    absolutePathTsConfig: path.normalize(path.join(process.cwd(), './tsconfig.json')),
    includeGlob: ['./app/ng-module.ts', './app/main.ts', './app/polyfills.ts'],
    pathToNgc: path.normalize(path.join(process.cwd(), './node_modules/.bin/ngc'))
  }, function(err) {
    // if an error occurred, just return
    if (err) {
      done(err);
      return;
    }
    // do webpack stuff
    runWebpack(function(webpackErr) {
      // either way, we want to delete the contents of .ngc
      //deleteNgcDir();
      done(webpackErr);
    });
  })
});

function deleteNgcDir() {
  var del = require('del');
  del.sync('./.ngc');
}

function runWebpack(done) {
  var compiler = webpack(webpackConfig);

  compiler.run(function(err, stats) {
    if (err) {
      console.log('webpack', stats.toString({}));
    }
    done(err);
  });
}

gulp.task('copy-assets', function() {
  return gulp.src('./assets/**/*').pipe(gulp.dest('./dist/assets'));
});

gulp.task('copy-dist', function() {
  return gulp.src('./dist/**/*').pipe(gulp.dest('./www'));
});

gulp.task('build', function(done){
  runSequence('clean', 'bundle-js', 'copy-dist', done);
});


gulp.task('clean', function(){
  return del('www/build');
});
gulp.task('lint', tslint);

