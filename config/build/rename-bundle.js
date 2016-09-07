// rollup creates a bundle, then tsc converts it to es5. They must be two separate files
// so delete the rollup bundle and rename the es5 bundle when the process is done
var del = require('del');
var fs = require('fs');

// args are node, script being executed, then actual args
if ( process.argv.length !== 5 ) {
    throw new Error("Usage: rollupBundlePath, es5BundlePath, finalBundlePath");
}
var rollupBundle = process.argv[2];
var es5Bundle = process.argv[3];
var finalBundlePath = process.argv[4];

// delete rollupBundle
del.sync(rollupBundle);

// copy es5 bundle to a better name
var es5BundleContent = fs.readFileSync(es5Bundle);
fs.writeFileSync(finalBundlePath, es5BundleContent);

// delete the es5 bundle
del.sync(es5Bundle);