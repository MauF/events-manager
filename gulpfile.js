var gulp = require('gulp');
var colors = require('colors');

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
}
 
// We'll need a reference to the tinylr
// object to send notifications of file changes
// further down
var lr;
function startLivereload() {
 
  lr = require('tiny-lr')();
  lr.listen(LIVERELOAD_PORT);
}
 
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
}
 
// Default task that will be run
// when no parameter is provided
// to gulp
gulp.task('default', function () {
  startExpress();
  startLivereload();
  gulp.watch(['./app/index.html','./app/partials/*.html','./app/css/*.css','./app/js/*.js'], notifyLivereload);
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