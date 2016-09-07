var path = require('path');
var componentSass = require('./index');


var ComponentSassPlugin = function(opts) {
  this.opts = opts;
};


ComponentSassPlugin.prototype.apply = function(compiler) {
  var opts = this.opts;
  var modulePaths = [];

  if (!opts.file) {
    // only check modules if there wasn't a root sass file already provided
    compiler.plugin('compilation', function(compilation, params) {

      compilation.plugin('after-optimize-chunks', function(chunks) {

        chunks.forEach(function(chunk) {

          chunk.modules.forEach(function(module) {
            var absolutePath = path.dirname(module.request);
            if (modulePaths.indexOf(absolutePath) < 0) {
              modulePaths.push(absolutePath);
            }
          });

        });

      });

    });
  }

  compiler.plugin('done', function() {
    componentSass(modulePaths, opts);
  });
};


module.exports = ComponentSassPlugin;
