var gulp = require('gulp');
var gulpWatch = require('gulp-watch');
var del = require('del');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');
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

gulp.task('lint', require('ionic-gulp-tslint'));
gulp.task('clean', function(){
  return del('www/build');
});

/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
//gulp.task('serve:before', ['watch']);
gulp.task('serve:before', ['build']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

/*
 *
 */
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

/*
 *
 */
gulp.task('build', ['clean'], function(done){
  var compiler = webpack(webpackConfig);

  compiler.run(function(err, stats) {
    if (err) {
      console.log('webpack', stats.toString({}));
    }
    done();
  });
});
