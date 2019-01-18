const gulp = require('gulp');
const runSequence = require('run-sequence');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');
const filter = require('gulp-filter');
const cleanCSS = require('gulp-clean-css');

const sassIn = 'scss/**/*.scss';
const sassOut = 'build/css';

gulp.task('sequence', () => runSequence('sass'));

const sassOpts = {
    errLogToConsole: true,
    outputStyle: 'expanded',
};

gulp.task('sass', () => {
    gulp
        .src(sassIn)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOpts).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(sourcemaps.write('sourcemaps'))
        .pipe(gulp.dest(sassOut))
        .pipe(filter('**/*.css'))
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(sassOut));
});

gulp.task('watch', () => {
    const note = event => {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    };

    gulp.watch([sassIn], ['sass']).on('change', note);
});

gulp.task('default', ['sequence', 'watch']);
