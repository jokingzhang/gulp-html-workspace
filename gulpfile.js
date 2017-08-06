var gulp = require("gulp");
var concat = require("gulp-concat");
var babel = require('gulp-babel');
var uglify = require("gulp-uglify");
var sass = require('gulp-sass');
var rename = require("gulp-rename");
var copy = require("gulp-copy");
var path = require('path');
var render = require('gulp-ejs');
var fsextra = require('fs-extra');
var replace = require('gulp-replace');
var autoprefixer = require("gulp-autoprefixer");
var livereload = require("gulp-livereload");
var del = require("del");
var combiner = require("stream-combiner2");
var browserSync = require("browser-sync");
var argv = require('yargs').argv;
var preprocess = require('gulp-preprocess');
var reload = browserSync.reload;

var paths = {
  root: {
    src: 'src',
    dist: 'dist'
  },
  styles: {
    "src": [
      "src/assets/styles/*.scss",
    ],
    "dist": "dist/assets/css"
  },
  scripts: {
    "src": [
      "src/assets/js/*.js"
    ],
    "dist": "dist/assets/js",
    "offline": "offline/assets/js"
  },
  sources: {
    "src": "src/assets/sources/*",
    "dist": "dist/assets/sources"
  },
  libs: {
    "src": "src/assets/libs/**/*",
    "dist": "dist/assets/libs"
  },
  fonts: {
    "src": "src/assets/fonts/**/*",
    "dist": "dist/assets/fonts",
  },
  data: {
    "src": "src/assets/data/*",
    "dist": "dist/assets/data"
  },
  template: {
    "index": "src/index.ejs",
    "src": [
      "src/html/*.html"
    ],
    "dist": "dist/html",
  }
};


var folderAddress = path.join(__dirname, 'src/html/');

var htmlArr = fsextra.readdirSync(folderAddress);

htmlArr = htmlArr.filter(function(filename){
  if(/.html/.test(filename)){
    return filename;
  }
})

console.info("htmlArr===>", htmlArr);

gulp.task("scripts", function () {
  var combined = combiner.obj([
    gulp.src(paths.scripts.src)
        .pipe(concat('main.js'))
        .pipe(babel({
          presets: ['es2015']
        })),
    gulp.dest(paths.scripts.dist),
    livereload()
  ]);
  return combined;
});

// Compile sass
gulp.task("sass", function () {
  var combined = combiner.obj([
    gulp.src(paths.styles.src)
    .pipe(sass().on('error',sass.logError))
    .pipe(autoprefixer({
        "browsers": ["last 3 version"]
    }))
    .pipe(concat('main.css')),
    gulp.dest(paths.styles.dist),
    livereload()
  ]);
  return combined;
});

gulp.task("index", function () {
  return gulp
    .src(paths.template.index)
    .pipe(render({
      list: htmlArr
    }))
    .pipe(rename('index.html'))
    .pipe(gulp.dest(paths.root.dist));
});

gulp.task("template", function () {
  return gulp
    .src(paths.template.src)
    .pipe(gulp.dest(paths.template.dist));
});

gulp.task("sources", function () {
  return gulp
    .src(paths.sources.src)
    .pipe(gulp.dest(paths.sources.dist));
});

gulp.task("libs", function () {
  return gulp
    .src(paths.libs.src)
    .pipe(gulp.dest(paths.libs.dist));
});

gulp.task("fonts", function () {
  return gulp
    .src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dist));
});


gulp.task("data", function () {
  return gulp
    .src(paths.data.src)
    .pipe(gulp.dest(paths.data.dist));
});

gulp.task("browser-sync", function() {
    browserSync.init({
        server: "./dist",
        files: ["./dist/html/*.html","./dist/**/*","./dist/**/**/*"],
    });
});

// Rerun the task when a file changes
gulp.task("watch", function() {
  livereload.listen();
  gulp.watch(paths.scripts.src, ["scripts"]);
  gulp.watch(paths.styles.src, ["sass"]);
  gulp.watch(paths.template.index, ["index"]);
  gulp.watch(paths.template.src, ["template"]);
  gulp.watch(paths.sources.src, ["sources"]);
  gulp.watch(paths.fonts.src, ["fonts"]);
  gulp.watch(paths.libs.src, ["libs"]);
  gulp.watch(paths.data.src, ["data"]);
});

gulp.task("build", ["scripts","index","template","sass","sources","fonts","libs"], function() {});

// The default task (called when you run `gulp` from cli)
gulp.task("default", ["build", "browser-sync", "watch"]);
