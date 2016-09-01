var gulp = require('gulp');
var gulpWatch = require('gulp-watch');
var del = require('del');
var runSequence = require('run-sequence');
var webpack = require('webpack');
var webpackConfig = require('./build/webpack/webpack.config.js');
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
var copyScripts = require('ionic-gulp-scripts-copy');
var tsLint = require('ionic-gulp-tslint');

gulp.task('lint', tsLint);
gulp.task('clean', function(){
  return del(['www/build', 'dist']);
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

gulp.task('bundle-js', function(done) {
  runSequence('copy-src', 'run-ngc', 'webpack', /*'delete-tmp',*/ done);
});

gulp.task('delete-tmp', function(done) {
  var del = require('del');
  del.sync('./dist/tmp');
  done();
});

gulp.task('copy-src', function() {
  return gulp.src('./src/**/*').pipe(gulp.dest('./dist/tmp/ngc'));
});

gulp.task('run-ngc', function(done) {
  var exec = require('child_process').exec;
  exec('./node_modules/.bin/ngc -p ./build/ngc-config.json', function(err, stderr, stdout) {
    done(err);
  });
});

gulp.task('webpack', function(done) {
  var compiler = webpack(webpackConfig);

  compiler.run(function(err, stats) {
    if (err) {
      console.log('webpack', stats.toString({}));
    }
    done(err);
  });
});

gulp.task('copy-assets', function() {
  return gulp.src('./assets/**/*').pipe(gulp.dest('./dist/assets'));
});

gulp.task('copy-dist', function() {
  return gulp.src('./dist/**/*').pipe(gulp.dest('./www'));
});

gulp.task('build', function(done){
  runSequence('clean', 'bundle-js', 'sass', 'html', 'fonts', 'copy-assets', 'copy-dist', done);
});

gulp.task('sass', buildSass);
gulp.task('html', copyHTML);
gulp.task('fonts', copyFonts);
