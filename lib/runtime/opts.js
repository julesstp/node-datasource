
var _path       = require('path');
var _fs         = require('fs');

var flag;
var path;

if ((flag = process.argv.indexOf('-c')) > 0) {
  path = _path.join(XT.basePath, process.argv[flag+1]);
} else {
  path = _path.join(XT.basePath, 'lib', 'config.js');
}

// we want this to fail if the path is wrong
XT.opts = require(path);