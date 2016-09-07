var path = require('path');


function componentSass(modulePaths, opts) {
  // Ensure file's parent directory in the include path
  opts.includePaths = opts.includePaths || [];
  opts.includePaths.unshift(path.dirname(opts.outFile));

  opts.excludeModules = (opts.excludeModules || []).map(function(excludeModule) {
    return path.sep + excludeModule + path.sep;
  });

  opts.sortComponentPathsFn = (opts.sortComponentPathsFn || defaultSortComponentPathsFn);
  opts.sortComponentFilesFn = (opts.sortComponentFilesFn || defaultSortComponentFilesFn);

  opts.componentSassFiles = (opts.componentSassFiles || ['*.scss']);

  if (!opts.file) {
    generateSassData(modulePaths, opts);
  }

  renderSass(opts);
}


function generateSassData(componentPaths, opts) {
  /**
   * 1) Import user sass variables first since user variables
   *    should have precedence over default library variables.
   * 2) Import all library sass files next since library css should
   *    be before user css, and potentially have library css easily
   *    overridden by user css selectors which come after the
   *    library's in the same file.
   * 3) Import the user's css last since we want the user's css to
   *    potentially easily override library css with the same
   *    css specificity.
   */
  var userSassVariableFiles = getUserSassVariableFiles(opts);
  var componentSassFiles = getComponentSassFiles(componentPaths, opts);

  var sassImports = userSassVariableFiles.concat(componentSassFiles).map(function(sassImport) {
    return '"' + sassImport + '"';
  });

  if (sassImports.length) {
    opts.data = '@charset "UTF-8";';
    opts.data += '@import ' + sassImports.join(',') + ';';
  }
}


function getUserSassVariableFiles(opts) {
  // user variable files should be the very first imports
  if (Array.isArray(opts.variableSassFiles)) {
    return opts.variableSassFiles;
  }
  return [];
}


function getComponentSassFiles(modulePaths, opts) {
  var glob = require('glob-all');

  var componentSassFiles = [];
  var componentPaths = modulePaths.filter(function(modulePath) {
    return isComponentModule(modulePath, opts);
  });

  // sort all components with the library components being first
  // and user components coming lass, so it's easier for user css
  // to override library css with the same specificity
  componentPaths = componentPaths.sort(opts.sortComponentPathsFn);

  componentPaths.forEach(function(componentPath) {
    var componentFiles = glob.sync(opts.componentSassFiles, {
      cwd: componentPath
    });

    if (!componentFiles.length && componentPath.indexOf(path.sep + 'node_modules' +  path.sep) === -1) {
      // if we didn't find anything, see if this module is mapped to another directory
      for (var k in opts.componentToSassMap) {
        componentPath = componentPath.replace(path.sep + k + path.sep, path.sep + opts.componentToSassMap[k] + path.sep);
        componentFiles = glob.sync(opts.componentSassFiles, {
          cwd: componentPath
        });
      }
    }

    if (componentFiles.length) {
      componentFiles = componentFiles.sort(opts.sortComponentFilesFn);

      componentFiles.forEach(function(componentFile) {
        componentSassFiles.push(path.join(componentPath, componentFile));
      });
    }
  });

  return componentSassFiles;
}


function renderSass(opts) {
  var nodeSass = require('node-sass');

  nodeSass.render(opts, function(renderErr, sassResult) {
    if (renderErr) {
      // sass render error!
      console.log('[Sass error] line', renderErr.line, ' column', renderErr.column);
      console.log(renderErr.message);

    } else {
      // sass render success!
      renderSassSuccess(sassResult, opts);
    }
  });
}


function renderSassSuccess(sassResult, opts) {
  if (opts.autoprefixer) {
    // with autoprefixer
    var postcss = require('postcss');
    var autoprefixer = require('autoprefixer');

    postcss([autoprefixer(opts.autoprefixer)])
      .process(sassResult.css, {
        to: path.basename(opts.outFile),
        map: { inline: false }

      }).then(function(postCssResult) {
        postCssResult.warnings().forEach(function(warn) {
          console.warn(warn.toString());
        });

        var apMapResult = null;
        if (postCssResult.map) {
          apMapResult = JSON.parse(postCssResult.map.toString()).mappings;
        }

        writeOutput(opts, postCssResult.css, apMapResult);
      });

  } else {
    // without autoprefixer
    var sassMapResult = null;
    if (sassResult.map) {
      sassMapResult = JSON.parse(sassResult.map.toString()).mappings;
    }

    writeOutput(opts, sassResult.css, sassMapResult);
  }

}


function writeOutput(opts, cssOutput, mappingsOutput) {
  var fs = require('fs');

  fs.writeFile(opts.outFile, cssOutput, function(fsWriteErr) {
    if (fsWriteErr) {
      console.log('Error writing css file:', fsWriteErr);

    } else {
      console.log('Saved:', opts.outFile);

      if (mappingsOutput) {
        var sourceMapPath = path.join(path.dirname(opts.outFile), path.basename(opts.outFile) + '.map');

        fs.writeFile(sourceMapPath, mappingsOutput, function(fsWriteErr) {
          if (fsWriteErr) {
            console.log('Error writing css map file:', fsWriteErr);

          } else {
            console.log('Saved:', sourceMapPath);
          }
        });
      }
    }
  });
}


function isComponentModule(modulePath, opts) {
  for (var i = 0; i < opts.excludeModules.length; i++) {
    if (modulePath.indexOf(opts.excludeModules[i]) > -1) {
      return false;
    }
  }
  return true;
}


function defaultSortComponentPathsFn(a, b) {
  var aIndexOfNodeModules = a.indexOf('node_modules');
  var bIndexOfNodeModules = b.indexOf('node_modules');

  if (aIndexOfNodeModules > -1 && bIndexOfNodeModules > -1) {
    return (a > b) ? 1 : -1;
  }

  if (aIndexOfNodeModules > -1 && bIndexOfNodeModules === -1) {
    return -1;
  }

  if (aIndexOfNodeModules === -1 && bIndexOfNodeModules > -1) {
    return 1;
  }

  return (a > b) ? 1 : -1;
}


function defaultSortComponentFilesFn(a, b) {
  var aPeriods = a.split('.').length;
  var bPeriods = b.split('.').length;
  var aDashes = a.split('-').length;
  var bDashes = b.split('-').length;

  if (aPeriods > bPeriods) {
    return 1;
  } else if (aPeriods < bPeriods) {
    return -1
  }

  if (aDashes > bDashes) {
    return 1;
  } else if (aDashes < bDashes) {
    return -1
  }

  return (a > b) ? 1 : -1;
}

module.exports = componentSass;