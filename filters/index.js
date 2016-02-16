'use strict';

var fs = require('fs');
var path = require('path');

module.exports['md'] = function(file, callback) {
	fs.readFile(path.join(this.source_dir, file.file), 'utf8', function(err, data) {
		if (path.basename(file.file) == 'index.md' || path.basename(file.file) == 'index.markdown') {
			file.dest = file.file.replace(/index\.(md|markdown)/, 'index.html');
		}
		else {
			var base = path.basename(file.file).replace(/\.(md|markdown)/, '');
			file.dest = path.join(path.dirname(file.file), base, 'index.html');
		}
		file.contents = data;
		callback(file);
	});
};

module.exports['markdown'] = module.exports['md'];