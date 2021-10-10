import gulp from 'gulp'
import babel from 'gulp-babel'
import uglify from 'gulp-uglify'
import gulpSass from "gulp-sass"
import nodeSass from "node-sass"
import cleanCSS from 'gulp-clean-css'
import cssmin from "gulp-cssmin"
import autoprefixer from "gulp-autoprefixer"
import urlAdjuster from "gulp-css-url-adjuster"
import pug from 'gulp-pug'
import htmlmin from "gulp-htmlmin"
import prettyHtml from "gulp-pretty-html"
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin'
import webp from 'gulp-webp'
import ttf2woff2 from 'gulp-ttf2woff2'
import cache from 'gulp-cache'
import concat from 'gulp-concat'
import rename from 'gulp-rename'
import { create as bsCreate } from "browser-sync"
import gutil from "gulp-util"
import del from 'del'
import sourcemaps from 'gulp-sourcemaps'


const sass = gulpSass(nodeSass)
const browserSync = bsCreate()
const env = gutil.env.type

const paths = {
  styles: {
    src: ['app/src/scss/**/!(_)*.scss', 'app/src/scss/**/*.scss'],
    dest: ['app/dev/css/', 'app/dist/css/']
  },
  scripts: {
    src: ['app/src/js/**/*.js'],
    dest: ['app/dev/js/', 'app/dist/js/']
  },
  pages: {
    src: ['app/src/pug/**/!(_)*.pug', 'app/src/pug/**/*.pug'],
    dest: ['app/dev', 'app/dist']
  },
  libs: {
    srcCSS: ['node_modules/normalize.css/normalize.css',
      'node_modules/swiper/swiper-bundle.css',
      // 'node_modules/select2/dist/css/select2.css',
    ],
    srcJS: ['node_modules/jquery/dist/jquery.js',
      'node_modules/swiper/swiper-bundle.js',
      'node_modules/lazysizes/lazysizes.js',
      'node_modules/lazysizes/plugins/unveilhooks/ls.unveilhooks.js',
      // 'node_modules/jquery-validation/dist/jquery.validate.js',
      // 'node_modules/select2/dist/js/select2.js',
    ],
    destJS: ['app/dev/libs/js', 'app/dist/libs/js'],
    destCSS: ['app/dev/libs/css', 'app/dist/libs/css']
  },
  images: {
    src: ['app/src/img/**/*'],
    dest: ['app/dev/img', 'app/dist/img']
  },
  fonts: {
    src: ['app/assets/fonts/**/*.{eot,svg,ttf,woff,woff2}'],
    dest: ['app/dev/static/fonts', 'app/dist/static/fonts']
  },
  icons: {
    src: ['app/assets/icons/**/*'],
    dest: ['app/dev/static/icons', 'app/dist/static/icons']
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

export const clean = () => env === 'production' ? del(['app/dist']) : del(['app/dev'])

export function scss() {
  return gulp.src(paths.styles.src[0])
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.init())
    .pipe(sass({ outputStyle: 'nested' }).on('error', sass.logError))
    .pipe(env === 'production' ? autoprefixer({ overrideBrowserslist: ['last 2 versions'], cascade: true }) : gutil.noop())
    .pipe(urlAdjuster({
      replace: ['../../img/', '../img/']
    }))
    .pipe(env === 'production' ? cleanCSS() : gutil.noop())
    .pipe(concat('style.css'))
    .pipe(env === 'production' ? cssmin() : gutil.noop())
    .pipe(rename({ suffix: '.min' }))
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.write('./maps'))
    .pipe(env === 'production' ? gulp.dest(paths.styles.dest[1]) : gulp.dest(paths.styles.dest[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function libsCSS() {
  return gulp.src(paths.libs.srcCSS)
    .pipe(concat('libs-styles.css'))
    .pipe(cssmin())
    .pipe(rename({ basename: 'libs-styles', suffix: '.min' }))
    .pipe(env === 'production' ? gulp.dest(paths.libs.destCSS[1]) : gulp.dest(paths.libs.destCSS[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.init())
    .pipe(babel())
    .pipe(env === 'production' ? uglify() : gutil.noop())

    /**
     * pipe for create bundle scripts
     */

    // .pipe(env === 'production' ? concat('bundle.js') : gutil.noop())
    // .pipe(env === 'production' ? rename({ basename: 'bundle', suffix: '.min' }) : gutil.noop())

    .pipe(rename({ suffix: '.min' }))
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.write('./maps'))
    .pipe(env === 'production' ? gulp.dest(paths.scripts.dest[1]) : gulp.dest(paths.scripts.dest[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function libsJS() {
  return gulp.src(paths.libs.srcJS)
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat('libs-bundle.js'))
    .pipe(rename({ basename: 'libs-bundle', suffix: '.min' }))
    .pipe(env === 'production' ? gulp.dest(paths.libs.destJS[1]) : gulp.dest(paths.libs.destJS[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function pugToHtml() {
  return gulp.src(paths.pages.src[0])
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.init())
    .pipe(pug())
    .pipe(env === 'production' ? htmlmin({ removeComments: true, collapseWhitespace: true }) : prettyHtml({ indent_size: 2 }))
    .pipe(env === 'production' ? gutil.noop() : sourcemaps.write('./maps'))
    .pipe(env === 'production' ? gulp.dest(paths.pages.dest[1]) : gulp.dest(paths.pages.dest[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function imageOptimizer() {
  return gulp.src(paths.images.src)
    .pipe(cache(imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({ quality: 75, progressive: true }),
      // optipng({ optimizationLevel: 1 }), // optipng stopping of gulp assembly when somechanging in img folder 
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: true
          },
          {
            name: 'cleanupIDs',
            active: false
          }
        ]
      })
    ]
    )))
    .pipe(env === 'production' ? gulp.dest(paths.images.dest[1]) : gulp.dest(paths.images.dest[0]))
    .pipe(webp())
    .pipe(env === 'production' ? gulp.dest(paths.images.dest[1]) : gulp.dest(paths.images.dest[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function ttfToWoof2() {
  return gulp.src(paths.fonts.src)
    .pipe(ttf2woff2())
    .pipe(env === 'production' ? gulp.dest(paths.fonts.dest[1]) : gulp.dest(paths.fonts.dest[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function iconsCopier() {
  return gulp.src(paths.icons.src)
    .pipe(env === 'production' ? gulp.dest(paths.icons.dest[1]) : gulp.dest(paths.icons.dest[0]))
    .pipe(browserSync.reload({ stream: true }));
}

export function watchFiles() {
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.styles.src[1], scss)
  gulp.watch(paths.pages.src[1], pugToHtml)
  gulp.watch(paths.images.src, imageOptimizer)
  gulp.watch(paths.fonts.src, ttfToWoof2)
  gulp.watch(paths.icons.src, iconsCopier)
}

const build = gulp.series(clean, pugToHtml, gulp.parallel(watchFiles, browsersync, ttfToWoof2, iconsCopier, libsJS, libsCSS, scss, scripts, imageOptimizer))

export default build