#!/usr/bin/env node
var gulp = require('gulp');
var path = require('path');
var rootdir = process.argv[2];
require(path.join(rootdir, 'gulpfile.js'));
gulp.start('build');
