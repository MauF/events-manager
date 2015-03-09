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
var useref = require('gulp-useref');
var gulpif = require('gulp-if');

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
  gulp.src('app/dist/', {read: true, force: true}).pipe(log()).pipe(clean());
});

gulp.task('create-dist', function(callback) {
  runSequence('clean-dist-dir'
              ,['copy-font-dir'
              ,'copy-partials-dir'
              ,'copy-dist-util'
              ,'create-html']
              ,callback);
});
 
gulp.task('create-html', function () {
    var assets = useref.assets();
    
    return gulp.src('app/index.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCSS()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('app/dist'));
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