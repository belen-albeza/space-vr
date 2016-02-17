'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var merge = require('merge-stream');

var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync').create();

var path = require('path');
var del = require('del');

//
// js
//

var bundler = browserify([ path.join(__dirname, 'src', 'js', 'main.js') ]);
var bundle = function () {
    return bundler
        .bundle()
        .on('error', gutil.log)
        .pipe(source('bundle.js'))
        .pipe(gulp.dest(path.join(__dirname, '.tmp')))
        .pipe(browserSync.stream({once: true}));
};

gulp.task('js', bundle);

//
// build and dist
//

gulp.task('build', ['js']);

gulp.task('dist', ['build'], function () {
    var staticFiles = gulp.src([
        'src/fonts/**/*',
        'src/images/**/*',
        'src/*.html',
        'src/*.css'
    ], { base: path.join(__dirname, 'src')})
    .pipe(gulp.dest('dist'));

    var builtFiles = gulp.src([ '.tmp/**/*' ]).pipe(gulp.dest('dist'));

    return merge(staticFiles, builtFiles);
});

gulp.task('clean', function () {
    return del(['.tmp', 'dist']);
});


//
// dev mode
//

gulp.task('watch', function () {
    bundler = watchify(browserify([
        path.join(__dirname, 'src', 'js', 'main.js')
    ], watchify.args), watchify.args);
    bundler.on('update', bundle);
});

gulp.task('dev', ['watch', 'build'], function () {
    browserSync.init({
        server: ['src', '.tmp']
    });

    gulp.watch('src/**/*.{html,css}').on('change', browserSync.reload);
});

//
// default task
//

gulp.task('default', ['dist']);
