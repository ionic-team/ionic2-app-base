

var ComponentSassPlugin = function(opts) {
  this.opts = opts;
  this.opts.excludeModulePaths = (opts.excludeModules || []).map(function(excludeModule) {
    return '/' + excludeModule + '/';
  });
};


ComponentSassPlugin.prototype.apply = function(compiler) {
  var opts = this.opts;
  var validComponentPaths = [];

  compiler.plugin('compilation', function(compilation, params) {
    compilation.plugin('after-optimize-chunks', function(chunks) {
      addValidModules(chunks, validComponentPaths, opts);
    });
  });

  compiler.plugin('done', function() {
    generateCss(validComponentPaths, opts);
  });
};


function generateCss(componentPaths, opts) {
  console.log('generateCss, componentPaths: ' + componentPaths.length);

  opts.data = '@import "ionic";body{color:$text-color;}';

  renderSass(opts);
};


function addComponentSass(modulePath) {

}


function addValidModules(chunks, validComponentPaths, opts) {
  chunks.forEach(function(chunk) {
    chunk.modules.forEach(function(module) {
      if (isValidModule(module, opts)) {
        validComponentPaths.push(module.request);
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
  var fs = require('fs');
  var path = require('path');

  // Ensure file's parent directory in the include path
  if (opts.includePaths) {
    if (typeof opts.includePaths === 'string') {
      opts.includePaths = [opts.includePaths];
    }

  } else {
    opts.includePaths = [];
  }
  opts.includePaths.unshift(path.dirname(opts.outFile));

  nodeSass.render(opts, function(renderErr, renderResult) {
    if (renderErr) {
      // sass render error!
      console.log('Sass error, line', renderErr.line, ' column', renderErr.column);
      console.log(renderErr.message);

    } else {
      // sass render success!

      fs.writeFile(opts.outFile, renderResult.css, function(fsWriteErr) {
        if (fsWriteErr) {
          console.log('Error writing css file:', fsWriteErr);
        } else {
          console.log('Saved:', opts.outFile);
        }
      });

      if (renderResult.map) {
        var mapResult = JSON.parse(renderResult.map.toString());
        var sourceMapPath = path.join(path.dirname(opts.outFile), mapResult.file + '.map');

        fs.writeFile(sourceMapPath, mapResult.mappings, function(fsWriteErr) {
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
