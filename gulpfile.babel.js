import gulp from 'gulp'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import rename from 'gulp-rename'
import cleanCSS from 'gulp-clean-css'
import gulpSass from "gulp-sass"
import nodeSass from "node-sass"
import gutil from "gulp-util"
import htmlmin from "gulp-htmlmin"
import { create as bsCreate } from "browser-sync"
import del from 'del'
import pug from 'gulp-pug'
import sourcemaps from 'gulp-sourcemaps'
const sass = gulpSass(nodeSass)
const browserSync = bsCreate()

const env = gutil.env.type

const paths = {
  styles: {
    src: ['app/src/css/**/*.css', 'app/src/scss/**/*.scss'],
    dest: ['app/dev/css/', 'app/dist/css/']
  },
  scripts: {
    src: ['node_modules/jquery/dist/jquery.min.js', 'app/src/js/**/*.js'],
    dest: ['app/dev/js/', 'app/dist/js/']
  },
  pages: {
    src: 'app/src/pug/**/!(_)*.pug',
    dest: ['app/dev', 'app/dist']
  }
}

export function browsersync() {
  browserSync.init({
    server: {
      baseDir: env === 'production' ? "./app/dist" : "./app/dev"
    },
    notify: false,
    online: true, // setting for wi-fi - 'false' disable ip adress
  })
}

export const clean = () => del(['dist', 'dev'])

export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.init())
    .pipe(sass({ outputStyle: 'nested' }).on('error', sass.logError))
    .pipe(env === 'production' ? cleanCSS() : gutil.noop())
    .pipe(concat('style.css'))
    .pipe(env === 'production' ? rename({ basename: 'main', suffix: '.min' }) : gutil.noop())
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.write('./maps'))
    .pipe(env === 'production' ? gulp.dest(paths.styles.dest[1]) : gulp.dest(paths.styles.dest[0]))
}

export function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.init())
    .pipe(babel())
    .pipe(env === 'production' ? uglify() : gutil.noop())
    .pipe(env === 'production' ? concat('bundle.js') : gutil.noop())
    .pipe(env === 'production' ? rename({ basename: 'bundle', suffix: '.min' }) : gutil.noop())
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.write('./maps'))
    .pipe(env === 'production' ? gulp.dest(paths.scripts.dest[1]) : gulp.dest(paths.scripts.dest[0]))
}

export function pugToHtml() {
  return gulp.src(paths.pages.src, { sourcemaps: true })
    .pipe(pug())
    .pipe(env === 'production' ? gutil.noop() : htmlmin({ collapseWhitespace: true }))
    .pipe(env === 'production' ? gulp.dest(paths.pages.dest[1]) : gulp.dest(paths.pages.dest[0]))
}

function watchFiles() {
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.pages.src, pugToHtml)
}

export { watchFiles as watch }

const build = gulp.series(clean, gulp.parallel(styles, scripts, pugToHtml, browsersync, watchFiles))

export default build