var gulp = require('gulp');
var colors = require('colors');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var gulpIgnore = require('gulp-ignore');
var runSequence = require('run-sequence');
var tap = require('gulp-tap');

var EXPRESS_PORT = 8000;
var EXPRESS_ROOT = __dirname;
var LIVERELOAD_PORT = 35729;
 
// Let's make things more readable by
// encapsulating each part's setup
// in its own method
function startExpress() {
 
  var express = require('express');
  var app = express();
  app.use(require('connect-livereload')());
  app.use(express.static(EXPRESS_ROOT));
  var server = app.listen(EXPRESS_PORT);
  console.log('\nserver started at '.yellow+server.address().address+':'+ server.address().port);
  console.log('\nHit CTRL-C to stop the server'.blue);
};
 
// We'll need a reference to the tinylr
// object to send notifications of file changes
// further down
var lr;
function startLivereload() {
 
  lr = require('tiny-lr')();
  lr.listen(LIVERELOAD_PORT);
};
 
// Notifies livereload of changes detected
// by `gulp.watch()` 
function notifyLivereload(event) {
 
  // `gulp.watch()` events provide an absolute path
  // so we need to make it relative to the server root
  var fileName = require('path').relative(EXPRESS_ROOT, event.path);
  console.log('file changed: '.blue+fileName);
  lr.changed({
    body: {
      files: [fileName]
    }
  });
};

function log() {
  return tap(function(file, t){console.log('---------> processing file: ' + file.path + ''.green);})
};
 
// Default task that will be run
// when no parameter is provided
// to gulp
gulp.task('default', function () {
  startExpress();
  startLivereload();
  gulp.watch(['./app/index.html','./app/partials/*.html','./app/css/*.css','./app/js/*.js'], notifyLivereload);
});

gulp.task('create-js-dist', function () {
  return gulp.src([
      'app/bower-components/angular/angular.js',
      'app/bower-components/angular-route/angular-route.js',
      'app/bower-components/angular-touch/angular-touch.js',
      'app/bower-components/angular-animate/angular-animate.js',
      'app/bower-components/angular-aria/angular-aria.js',
      'app/bower-components/angular-material/angular-material.js',
      'app/bower-components/angular-messages/angular-messages.js',
      // 'app/bower-components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower-components/md-date-time/dist/md-date-time.js',
      'app/bower-components/ngmap/build/scripts/ng-map.js',
      'app/bower-components/ngAutocomplete/src/ngAutocomplete.js',
      'app/bower-components/ngAutocomplete/src/ngAutocomplete.js',
      'app/js/*.js'
    ])
    // .pipe(sourcemaps.init())
    .pipe(concat('app.js'))
    .pipe(ngAnnotate())
    .pipe(uglify())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/dist'))
});

gulp.task('create-css-dist', function () {
  return gulp.src([
      'app/bower-components/bootstrap-css-only/css/bootstrap.css',
      'app/bower-components/angular-material/angular-material.css',
      'app/bower-components/md-date-time/dist/md-date-time.css',
      'app/css/app.css'
    ])
    .pipe(concat('app.css'))
    // .pipe(sourcemaps.init())
    .pipe(minifyCSS())
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/dist/css'));
});

gulp.task('copy-font-dir', function () {
  return gulp.src(['app/bower-components/bootstrap-css-only/fonts/**/*.*']).pipe(log()).pipe(gulp.dest('app/dist/fonts'));
});

gulp.task('copy-dist-util', function () {
  return gulp.src(['app/dist-util/*.*']).pipe(log()).pipe(gulp.dest('app/dist/'));
});

gulp.task('copy-partials-dir', function () {
  return gulp.src(['app/partials/**/*.*']).pipe(log()).pipe(gulp.dest('app/dist/partials'));
});

gulp.task('clean-dist-dir', function () {
  return gulp.src('app/dist/', {read: true, force: true}).pipe(log()).pipe(clean());
});

gulp.task('create-dist', function(callback) {
  runSequence('clean-dist-dir'
              ,'copy-font-dir'
              ,'copy-partials-dir'
              ,'copy-dist-util'
              ,'create-js-dist'
              ,'create-css-dist'
              ,callback);
});

if (process.platform !== 'win32') {
  //
  // Signal handlers don't work on Windows.
  //
  process.on('SIGINT', function () {
    console.log('\nServer stopped.'.red);
    process.exit();
  });
}