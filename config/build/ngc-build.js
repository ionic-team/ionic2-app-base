
function runNgc(pathToNgc, pathToConfigFile, done) {
    var exec = require('child_process').exec;
    var shellCommand = pathToNgc + ' -p ' + pathToConfigFile;
    exec(shellCommand, function(err, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
        done(err);
    });
}

function openAndParseJsonFile(absolutePath) {
    var fs = require('fs');
    var jsonString = fs.readFileSync(absolutePath);
    return JSON.parse(jsonString);
}

function createTempTsConfig(absolutePathToOriginal, includeGlob, absolutePathToWriteFile) {
    var originalConfig = openAndParseJsonFile(absolutePathToOriginal);
    if (!originalConfig) {
        throw new Error('Could not find original config file');
    }

    if (!originalConfig.compilerOptions) {
        throw new Error('TSConfig is missing necessary compiler options');
    }

    // delete outDir if it's set since we only want to compile to the same directory we're in
    if (originalConfig.compilerOptions.outDir) {
        delete originalConfig.compilerOptions.outDir;
    }

    // downstream, we have a dependency on es5 code and es2015 modules, so force them
    originalConfig.compilerOptions.module = 'es2015';
    originalConfig.compilerOptions.target = 'es5';

    originalConfig.include = includeGlob;

    var json = JSON.stringify(originalConfig, null, 2);

    var fs = require('fs');
    fs.writeFileSync(absolutePathToWriteFile, json);
}

function copyTypescriptSourceToDestination(absolutePathSourceDir, absolutePathDestDir, excludeSpecBool) {
    var vfs = require('vinyl-fs');
    var sourceGlob = [absolutePathSourceDir + '/**/*.ts'];
    if (excludeSpecBool) {
        sourceGlob.push('!' + absolutePathSourceDir + '/**/*.spec.ts');
    }
    return vfs.src(sourceGlob).pipe(vfs.dest(absolutePathDestDir));
}

function checkArguments(options) {
    if ( ! options ) {
        return {
            success: false,
            msg: 'Missing options object'
        };
    }
    if ( !options.absolutePathSrcDir || options.absolutePathSrcDir.length === 0 ) {
        return {
            success: false,
            msg: 'absolutePathSrcDir is a required field'
        };
    }
    if ( !options.absolutePathDestDir || options.absolutePathDestDir.length === 0 ) {
        return {
            success: false,
            msg: 'absolutePathDestDir is a required field'
        };
    }

    if ( !options.absolutePathTsConfig || options.absolutePathTsConfig.length === 0 ) {
        return {
            success: false,
            msg: 'absolutePathTsConfig is a required field'
        };
    }

    if ( !options.includeGlob || options.includeGlob.length === 0 ) {
        return {
            success: false,
            msg: 'includeGlob is a required field'
        };
    }

    if ( !options.pathToNgc || options.pathToNgc.length === 0 ) {
        return {
            success: false,
            msg: 'pathToNgc is a required field'
        };
    }

    return {
        success: true
    }
}

function copyAndBuildTypescript(options, done) {
    var result = checkArguments(options);
    if (!result.success) {
        done(new Error(result.msg));
        return;
    }

    // first, copy typescript src to some destination
    var stream = copyTypescriptSourceToDestination(options.absolutePathSrcDir, options.absolutePathDestDir, true);
    stream.on('end', function() {
        var destTsConfigPath = options.absolutePathDestDir + '/tsconfig.json';
        createTempTsConfig(options.absolutePathTsConfig, options.includeGlob, destTsConfigPath);
        runNgc(options.pathToNgc, destTsConfigPath, function(err) {
            done(err);
        });
    });
}

module.exports = {
    copyAndBuildTypescript: copyAndBuildTypescript
}