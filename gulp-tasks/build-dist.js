'use strict'

var gulp = require('gulp');
var uglify = require('gulp-uglify-es').default;
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var del = require('del');
var runSequence = require('run-sequence');
var replace = require('gulp-replace');
var vfs = require('vinyl-fs');

var paths = gulp.paths;
var pkg = gulp.pkg;

gulp.vendors = require('./../vendors.json');
var vendors = gulp.vendors;

gulp.task('copy:vendorsCSS', function() {
    return gulp.src(vendors.css)
        .pipe(gulp.dest(paths.vendors + 'css/'));
});

gulp.task('minify:vendorsCSS', function() {
    return gulp.src([
        paths.vendors + 'css/*.css',
        '!' + paths.vendors + 'css/*.min.css'
    ])
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.vendors + 'css/'));
});

gulp.task('clean:vendorsCSS', function () {
    return del([
        paths.vendors + 'css/*.css',
        '!' + paths.vendors + 'css/*.min.css'
    ],{force: true});
    // force option to allow file manipulation outside working directory
});

gulp.task('vendors:css', function(callback) {
    runSequence('copy:vendorsCSS', 'minify:vendorsCSS', 'clean:vendorsCSS', callback);
});

gulp.task('copy:vendorsJS', function() {
    return gulp.src(vendors.js)
        .pipe(gulp.dest(paths.vendors + 'js/'));
});

gulp.task('minify:vendorsJS', function() {
    return gulp.src([
        paths.vendors + 'js/*.js',
        '!' + paths.vendors + 'js/*.min.js'
    ])
        .pipe(gulp.dest(paths.vendors + 'js/'))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest(paths.vendors+'js/'));
});

gulp.task('clean:vendorsJS', function () {
    return del([
        paths.vendors + 'js/*.js',
        '!' + paths.vendors + 'js/*.min.js'], {force: true});
});

gulp.task('vendors:js', function(callback) {
    runSequence('copy:vendorsJS', 'minify:vendorsJS', 'clean:vendorsJS', callback);
});

gulp.task('copy:vendorsFonts', function() {
    return gulp.src(vendors.fonts)
        .pipe(gulp.dest(paths.vendors + 'fonts/'));
});

gulp.task('copy:vendorsFlags', function() {
    return gulp.src(vendors.flags)
        .pipe(gulp.dest(paths.vendors + 'flags/'));
});

gulp.task('replace:node_modules', function(){
    return gulp.src([
        paths.dist + '**/*.html',
        paths.dist + '**/*.js',
    ], {base: './'})
        .pipe(replace(/node_modules.[^\]\>]+(\/[a-z0-9][^/]*\.js+(\'|\"))/ig, 'vendors/js$1'))
        .pipe(replace(/[\'\"]vendors\/js\/(.[^\]\>]*).js(\'|\")/ig, '"vendors/js/$1.min.js"'))
        .pipe(replace(/"..\/..\/vendors\/js\/(.[^/\>]*).js(\'|\")/ig, '"../../vendors/js/$1.min.js"'))
        .pipe(replace('.min.min.js', '.min.js'))
        .pipe(replace(/node_modules+.+(\/[a-z0-9][^/]*\.css+(\'|\"))/ig, 'vendors/css$1'))
        .pipe(replace(/[\'\"]vendors\/css\/(.*).css(\'|\")/ig, '"vendors/css/$1.min.css"'))
        .pipe(replace(/"..\/..\/vendors\/css\/(.*).css(\'|\")/ig, '"../../vendors/css/$1.min.css"'))
        .pipe(replace('.min.min.css', '.min.css'))
        .pipe(gulp.dest('./'));
});

/** Summernote 가 필요로 하는 font 의 경로를 CoreUI Theme 에 맞게 바꿔줘야했음
 *  안 하면 Summernote 에디터가 깨져서 보임 */
gulp.task('replace:summernoteCSS', function () {
    return gulp.src([
        paths.vendors + 'css/summernote-bs4.min.css'
    ], {base: './'})
        .pipe(replace(/\(\.\/font/ig, '(../fonts'))
        .pipe(gulp.dest('./'));
});

gulp.task('vendors', function(callback) {
    runSequence('vendors:css', 'vendors:js', 'copy:vendorsFonts', 'copy:vendorsFlags', 'replace:node_modules', 'replace:summernoteCSS', callback);
});

gulp.task('replace:url', function () {
    return gulp.src([
        paths.dist + 'js/app.main.js',
        paths.dist + 'js/pages/login.js'
    ], {base: './'})
        .pipe(replace(/http:\/\/localhost:8080/g, ''))
        .pipe(replace(/http:\/\/985b087b.ngrok.io/g, ''))
        .pipe(gulp.dest('./'));
});

gulp.task('clean:dist', function () {
    return del(paths.dist, {force: true});
});

gulp.task('copy:css', function() {
    return gulp.src(paths.src + 'css/**/*')
        .pipe(gulp.dest(paths.dist + 'css'));
});

gulp.task('copy:img', function() {
    return gulp.src(paths.src + 'img/**/*')
        .pipe(gulp.dest(paths.dist + 'img'));
});

gulp.task('copy:js', function() {
    return gulp.src(paths.src + 'js/**/*')
        .pipe(uglify())
        .pipe(gulp.dest(paths.dist + 'js'));
});

gulp.task('copy:media', function() {
    return gulp.src(paths.src + 'media/**/*')
        .pipe(gulp.dest(paths.dist + 'media'));
});

gulp.task('copy:views', function() {
    return gulp.src(paths.src + 'views/**/*')
        .pipe(gulp.dest(paths.dist + 'views'));
});

gulp.task('copy:pages', function() {
    return gulp.src(paths.src + 'pages/**/*')
        .pipe(gulp.dest(paths.dist + 'pages'));
});


gulp.task('copy:html', function() {
    var framework = pkg.name.split('/')[1];
    if (framework == 'ajax') {
        return gulp.src(paths.src + 'index.html')
            .pipe(gulp.dest(paths.dist));
    } else {
        return gulp.src(paths.src + '**/*.html')
            .pipe(gulp.dest(paths.dist));
    }
});

gulp.task('copy:vendors', function() {
    return gulp.src(paths.src + 'vendors/**/*')
        .pipe(gulp.dest(paths.dist + 'vendors/'));
});

/** CoreUI Theme 의 기본 Build Task. 아래 Task 들은 이것에서 파생되었던 것임 */
gulp.task('build:dist', function(callback) {
    runSequence('clean:dist', 'copy:css', 'copy:img', 'copy:js', 'copy:media', 'copy:views', 'copy:html', 'copy:vendors', 'vendors', 'replace:url', callback);
});