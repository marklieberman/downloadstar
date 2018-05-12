var gulp   = require('gulp'),
    jshint = require('gulp-jshint'),
    sass   = require('gulp-sass'),
    zip    = require('gulp-zip');

var sources = {
  js: [
    'src/**/*.js',
    '!**/lib/**'
  ],
  sass: [
    'src/popup/lib/*.scss',
    'src/popup/popup.scss'
  ],
  dist: [
    'src/**',
    '!**/*.scss'
  ]
};

gulp.task('default', [ 'lint', 'sass', 'watch' ]);

gulp.task('watch', function () {
  gulp.watch(sources.js, [ 'lint' ]);
  gulp.watch(sources.sass, [ 'sass' ]);
});

gulp.task('sass', function () {
  gulp.src(sources.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('src/popup/'));
});

gulp.task('lint', function () {
  return gulp.src(sources.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('dist', [ 'sass' ], function () {
  return gulp.src(sources.dist)
    .pipe(zip('downloadstar.xpi', {
      compress: false
    }))
    .pipe(gulp.dest('dist'));
});
