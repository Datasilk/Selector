'use strict';

//includes
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify')

//tasks
gulp.task('selector', function () {
    return gulp.src('selector.js', { base: '.' })
        .pipe(concat('dist/selector.js'))
        .pipe(gulp.dest('.', { overwrite: true }));
});

gulp.task('selector-min', function () {
    return gulp.src('selector.js', { base: '.' })
        .pipe(concat('dist/selector.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('.', { overwrite: true }));
});

gulp.task('compile', ['selector', 'selector-min']);

gulp.task('watch', function(){
    gulp.watch('selector.js', ['compile']);
});