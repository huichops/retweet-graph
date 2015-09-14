import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserify from 'browserify';
import babelify from 'babelify';
import watchify from 'watchify';
import browserSync from 'browser-sync';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const $ = gulpLoadPlugins();
const reload = browserSync.reload;


function lint(files, options) {
  return () => {
    return gulp.src(files)
      .pipe($.eslint(options))
      .pipe($.eslint.format())
  }
}

gulp.task('lint', lint(['src/**/*.js', 'app/scripts/**/*.js']));

gulp.task('browserify', () => {
  var bundler = browserify({
    entries: 'app/scripts/app.js',
    debug: true,
    transform: [babelify]
  });

  bundler = watchify(bundler);

  var rebundle = () => {
    return bundler.bundle()
    .on('error', $.util.log)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({ loadMaps: true }))
    .on('error', $.util.log)
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/scripts'));
  }

  bundler.on('update', rebundle);

  return rebundle();

});

gulp.task('styles', () => {
  return gulp.src('./sass/**/*.scss')
    .pipe($.sass().on('error', $.sass.logError))
    .pipe(gulp.dest('./app/styles'));
});

gulp.task('server', () => {
    $.nodemon({
        script: './server/server.js',
        watch: ['src/**/*.js', 'config/*.json']
    });
});


gulp.task('serve', ['styles', 'browserify', 'babel', 'server'], () => {
  browserSync({
    notify: false,
    open: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/styles/**/*.css',
    '.tmp/scripts/**/*.js'
  ]).on('change', reload);


  gulp.watch('src/**/*.js', ['babel']);
  gulp.watch('./sass/**/*.scss', ['styles']);
});


gulp.task('babel', () => {
  return gulp.src('src/**/*.js')
    .pipe($.babel())
    .pipe(gulp.dest('server'));
});

gulp.task('default', ['lint', 'serve']);
