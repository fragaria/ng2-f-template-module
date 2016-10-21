var fs = require('fs');
var del = require('del');
var gulp = require('gulp');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var prompt = require('gulp-prompt');
var vinylPaths = require('vinyl-paths');

var BASE_DIR = 'src';

var forReplace = {
  templatePackage: 'ng2-f-template-module',
  templateModuleNG2Name: 'SeedModule',
  templateModuleFileName: 'seed.module',
  templateModuleDirName: 'seed-module',
  templateComponentNG2Name: 'SeedComponent',
  templateComponentFileName: 'seed.component',
  templateFileNamePrefix: 'seed'
};

var locations = {
  globalDirs: ['.git'],
  files: [pathWithBaseDir('/*module/*.js'), pathWithBaseDir('/*module/*.ts'), 'index.ts', 'package.json'],
  seedFiles: [pathWithBaseDir('/*module/seed*')],
  moduleDirParent: BASE_DIR
};

function pathWithBaseDir(strPath) {
  return BASE_DIR + strPath
}

function moduleNameToClassForm(moduleName) {
  return moduleName.split("-").map(upperFirstLetter).join("")
}

function normalizeModuleName(name) {
  return name.toLowerCase().replace(" ", "-")
}

function upperFirstLetter(item) {
  return item.charAt(0).toUpperCase() + item.substr(1).toLowerCase()
}

function getModuleFileName(moduleName) {
  return moduleName + '.module'
}

function getModuleNG2Name(moduleName) {
  return moduleNameToClassForm(moduleName) + 'Module';
}

function getComponentFileName(moduleName) {
  return moduleName + '.component'
}

function getComponentNG2Name(moduleName) {
  return moduleNameToClassForm(moduleName) + 'Component';
}

function userInputsPostProcess(userInputs) {
  var packageName = userInputs.packageName ? userInputs.packageName : 'ng2-f-my-package';
  packageName = normalizeModuleName(packageName);
  var moduleName = userInputs.module ? userInputs.module : packageName;
  moduleName = normalizeModuleName(moduleName);
  var packageData = { packageName: packageName, moduleName: moduleName };

  packageData['moduleFileName'] = getModuleFileName(moduleName);
  packageData['moduleNG2Name'] = getModuleNG2Name(moduleName);
  packageData['componentFileName'] = getComponentFileName(moduleName);
  packageData['componentNG2Name'] = getComponentNG2Name(moduleName);

  removeGlobalDirs();
  replaceTemplatePatternsInFiles(packageData)
    .on('end', function() { renameTemplateFiles(packageData)
      .on('end', function() { removeSeedFiles()
        .then(function() { renameTemplateModuleDir(packageData) })
      })
    });
}

function replaceTemplatePatternsInFiles(packageData) {
  //value is in res.task (the name option gives the key)
  return gulp.src(locations.files)
    .pipe(replace(forReplace.templatePackage, packageData.packageName))
    .pipe(replace(forReplace.templateModuleNG2Name, packageData.moduleNG2Name))
    .pipe(replace(forReplace.templateModuleFileName, packageData.moduleFileName))
    .pipe(replace(forReplace.templateModuleDirName, packageData.moduleName))
    .pipe(replace(forReplace.templateComponentNG2Name, packageData.componentNG2Name))
    .pipe(replace(forReplace.templateComponentFileName, packageData.componentFileName))
    .pipe(gulp.dest(function (file) { return file.base }))
}

function renameTemplateFiles(packageData) {
  return gulp.src(locations.seedFiles)
    .pipe(rename(function (path) {
      path.basename = path.basename.replace(forReplace.templateFileNamePrefix, packageData.moduleName);
    }))
    .pipe(gulp.dest("./" + locations.moduleDirParent))
}

function renameTemplateModuleDir(packageData) {
  var oldModulePath = "./" + locations.moduleDirParent + "/" + forReplace.templateModuleDirName;
  var newModulePath = "./" + locations.moduleDirParent + "/" + packageData.moduleName;
  return fs.rename(oldModulePath, newModulePath, function (err) {
    if (err) throw err;
    console.log('Module ' + oldModulePath + ' was renamed to ' + newModulePath);
  });
}

function removeSeedFiles() {
  return del(locations.seedFiles)
}

gulp.task('cleanup:seed', function() {
  removeSeedFiles();
});

function removeGlobalDirs() {
  return del(locations.globalDirs)
}

gulp.task('cleanup:global', function() {
  removeGlobalDirs();
});

gulp.task('prepare-module', function() {
  gulp.src(locations.files).pipe(prompt.prompt([{
    type: 'input',
    name: 'packageName',
    message: 'Get package name?'
  },
  {
    type: 'input',
    name: 'module',
    message: 'Get module name?'
  }], userInputsPostProcess));
});
