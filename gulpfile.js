'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var babelify = require('babelify');

gulp.task('build', ['build-afinn', 'build-keywords', 'build-readability']);

function buildWorker(src, filename, dst = './webworkers/') {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: src,
    debug: true,
    transform: [
      babelify.configure({
        presets: ['es2015']
      })
    ]
  });

  return b
    .bundle()
    .pipe(source(filename))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dst));
}

gulp.task('build-afinn', () =>
  buildWorker('./src/afinn-worker.js', 'afinn-worker.js')
);

gulp.task('build-keywords', () =>
  buildWorker('./src/keywords-worker.js', 'keywords-worker.js')
);

gulp.task('build-readability', () =>
  buildWorker('./src/readability-worker.js', 'readability-worker.js')
);
