var fs = require('fs');
var path = require('path');

var sourceHtmlPath = path.normalize(path.join(process.cwd(), './src/index.html'));
var destHtmlPath = path.normalize(path.join(process.cwd(), './www/index.html'));

fs.createReadStream(sourceHtmlPath).pipe(fs.createWriteStream(destHtmlPath));