'use strict';
// generated on 2014-06-18 using generator-tiy-webapp 0.0.0

// Set your Github Repo Here
var gh_repo = "git remote add origin git@github.com:joshdaniels/rando.git";

// Require your modules
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rimraf = require('rimraf');
var deploy = require('gulp-gh-pages');

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'compressed',
      precision: 10
    }))
    .pipe($.autoprefixer('last 1 version'))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('html', ['styles'], function () {

  return gulp.src('app/*.html')
    .pipe($.useref.assets({searchPath: '{.tmp,app}'}))
    .pipe($.if('*.css', $.csso()))
    .pipe($.useref.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('extras', function () {
  return gulp.src(['app/*.*', '!app/*.html'], {dot: true})
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function (cb) {
  rimraf('.tmp', function () {
    rimraf('dist', cb);
  });
});

gulp.task('connect', function () {
  var connect = require('connect');
  var app = connect()
    .use(require('connect-livereload')({port: 35729}))
    .use(connect.static('app'))
    .use(connect.static('.tmp'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', connect.static('bower_components'))
    .use(connect.directory('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'styles'], function () {
  require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({directory: 'bower_components'}))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      directory: 'bower_components'
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['html', 'images', 'extras'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});

gulp.task('deploy', function() {
  if(gh_repo !== ''){
    gulp.src("./dist/**/*")
      .pipe(deploy(gh_repo, 'origin'));
  } else {
    console.log('Oops!! You forgot to set your `gh_repo` variable in your gulpfile.js!');
  }
});
