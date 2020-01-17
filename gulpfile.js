var gulp     = require('gulp'),
    jshint   = require('gulp-jshint'),
    jsonlint = require("gulp-jsonlint"),
    sass     = require('gulp-sass'),
    zip      = require('gulp-zip');

var sources = {
  js: [
    'src/**/*.js',
    '!**/lib/**'
  ],
  json: [
    'src/manifest.json',
    'src/_locales/**/*.json'
  ],
  sass: [
    'src/popup/popup.scss',
    'src/options/options.scss',
    'src/queue/queue.scss',
    'src/history/history.scss'
  ],
  watch: {
    sass: [
      'src/common/**.scss'
    ]
  },
  dist: [
    'src/**',
    '!**/*.scss'
  ]
};

function watchFiles () {
  gulp.watch(sources.js, lintTask);
  gulp.watch(sources.json, jsonlintTask);
  gulp.watch(sources.sass, sassTask);

  // Other sass files import these, so build them when these change.
  gulp.watch(sources.watch.sass, sassTask);
}

function sassTask () {
  return gulp.src(sources.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
}

function lintTask () {
  return gulp.src(sources.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
}

function jsonlintTask () {
  return gulp.src(sources.json)
    .pipe(jsonlint())
    .pipe(jsonlint.reporter());
}

function copyTask () {
  return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(gulp.dest('src/common/fa-webfonts/'));
}

function distTask () {
  return gulp.src(sources.dist)
    .pipe(zip('downloadstar.xpi', {
      compress: false
    }))
    .pipe(gulp.dest('dist'));
}

exports.sass = sassTask;
exports.lint = lintTask;
exports.jsonlint = jsonlintTask;
exports.copy = copyTask;
exports.dist = distTask;

exports.watch = gulp.series(sassTask, watchFiles);
exports.travis = gulp.series(gulp.parallel(copyTask, lintTask, jsonlintTask, sassTask));
exports.default = gulp.series(gulp.parallel(copyTask, lintTask, jsonlintTask, sassTask), watchFiles);