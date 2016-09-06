var path = require('path');


var ComponentSassPlugin = function(opts) {
  this.opts = opts;

  this.opts.excludeModulePaths = (opts.excludeModules || []).map(function(excludeModule) {
    return '/' + excludeModule + '/';
  });

  opts.sortComponentPathsFn = (opts.sortComponentPathsFn || defaultSortComponentPathsFn);
  opts.sortComponentFilesFn = (opts.sortComponentFilesFn || defaultSortComponentFilesFn);

  opts.componentSassFilePattern = (opts.componentSassFilePattern || ['*.scss']);
};


ComponentSassPlugin.prototype.apply = function(compiler) {
  var opts = this.opts;
  var validComponentPaths = [];

  if (!opts.file) {
    // only check modules if there wasn't a root sass file already provided
    compiler.plugin('compilation', function(compilation, params) {
      compilation.plugin('after-optimize-chunks', function(chunks) {
        addValidModules(chunks, validComponentPaths, opts);
      });
    });
  }

  compiler.plugin('done', function() {
    generateCss(validComponentPaths, opts);
  });
};


function generateCss(componentPaths, opts) {
  console.log('generateCss, componentPaths: ' + componentPaths.length);

  if (!opts.file) {
    generateSassData(componentPaths, opts);
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
  var sassImports = importUserVariables(opts);

  importComponentSass(sassImports, componentPaths, opts);

  sassImports = sassImports.map(function(sassImport) {
    return '"' + sassImport + '"';
  });

  if (sassImports.length) {
    opts.data = '@charset "UTF-8";';
    opts.data += '@import ' + sassImports.join(',') + ';';
  }
}


function importUserVariables(opts) {
  // user variable files should be the very first imports
  if (Array.isArray(opts.variableSassFiles)) {
    return opts.variableSassFiles;
  }
  return [];
}


function importComponentSass(sassImports, componentPaths, opts) {
  var glob = require('glob-all');
  // sort all components with the library components being first
  // and user components coming lass, so it's easier for user css
  // to override library css with the same specificity
  componentPaths = componentPaths.sort(opts.sortComponentPathsFn);

  componentPaths.forEach(function(componentPath) {
    var componentFiles = glob.sync(opts.componentSassFiles, {
      cwd: componentPath
    });

    if (componentFiles.length) {
      componentFiles = componentFiles.sort(opts.sortComponentFilesFn);

      componentFiles.forEach(function(componentFile) {
        sassImports.push(path.join(componentPath, componentFile));
      });
    }
  });
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


function addValidModules(chunks, validComponentPaths, opts) {
  chunks.forEach(function(chunk) {
    chunk.modules.forEach(function(module) {
      if (isValidModule(module, opts)) {
        var componentPath = path.dirname(module.request);
        if (validComponentPaths.indexOf(componentPath) < 0) {
          validComponentPaths.push(componentPath);
        }
      }
    });
  });
};


function isValidModule(modulePath, opts) {
  for (var i = 0; i < opts.excludeModulePaths.length; i++) {
    if (modulePath.request.indexOf(opts.excludeModulePaths[i]) > -1) {
      return false;
    }
  }
  return true;
}

function renderSass(opts) {
  var nodeSass = require('node-sass');

  // Ensure file's parent directory in the include path
  opts.includePaths = opts.includePaths || [];
  opts.includePaths.unshift(path.dirname(opts.outFile));

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
        to:   path.basename(opts.outFile),
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

module.exports = ComponentSassPlugin;
