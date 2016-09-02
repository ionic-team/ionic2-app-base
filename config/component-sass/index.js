

var ComponentSassPlugin = function(opts) {
  this.options = opts;
};

ComponentSassPlugin.prototype.apply = function(compiler) {
  var self = this;
  compiler.plugin('compilation', function(compilation, params) {
    compilation.plugin('after-optimize-chunk-assets', function(chunks) {
      self.afterOptimizeChunkAssets(chunks);
    });
  });
};

ComponentSassPlugin.prototype.afterOptimizeChunkAssets = function(chunks) {
  console.log(chunks.map(function(c) {
      return {
          id: c.id,
          name: c.name,
          includes: c.modules.map(function(m) {
              return m.request;
          })
      };
  }));
}



function generateCss(opts) {
  opts.data = 'body{color:red;}';
  renderCss(opts);
}

function collectSass(dir) {

}

function renderCss(opts) {
  var nodeSass = require('node-sass');
  nodeSass.render(opts, function(renderErr, renderResult) {
    if (renderErr) {
      // render error!
      console.log(renderErr.status);
      console.log(renderErr.column);
      console.log(renderErr.message);
      console.log(renderErr.line);

    } else {
      // render success!
      var fs = require('fs');
      fs.writeFile(opts.outFile, renderResult.css, function(fsWriteErr) {
        if (fsWriteErr) {
          console.log(fsWriteErr);
        }
      });
    }
  });
}

module.exports = ComponentSassPlugin;
