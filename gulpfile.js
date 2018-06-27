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

gulp.task('default', [ 'copy', 'lint', 'sass', 'watch' ]);

gulp.task('watch', function () {
  gulp.watch(sources.js, [ 'lint' ]);
  gulp.watch(sources.sass, [ 'sass' ]);
  gulp.watch(sources.watch.sass, [ 'sass' ]);
});

gulp.task('sass', function () {
  gulp.src(sources.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
});

gulp.task('lint', function () {
  return gulp.src(sources.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('copy', function () {
  gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(gulp.dest('src/common/fa-webfonts/'));
});

gulp.task('dist', [ 'copy', 'sass' ], function () {
  return gulp.src(sources.dist)
    .pipe(zip('downloadstar.xpi', {
      compress: false
    }))
    .pipe(gulp.dest('dist'));
});
