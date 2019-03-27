'use strict';

//includes
var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglifyes = require('uglify-es'),
    composer = require('gulp-uglify/composer'),
    uglify = composer(uglifyes, console)

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

gulp.task('compile', gulp.series('selector', 'selector-min'));

gulp.task('watch', function(){
    gulp.watch('selector.js', gulp.series('compile'));
});