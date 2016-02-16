'use strict';

var fs = require('fs');
var path = require('path');
var marked = require('marked');

module.exports['md'] = function(file, callback) {
	// Fix file name
	if (path.basename(file.file) == 'index.md' || path.basename(file.file) == 'index.markdown') {
		file.dest = file.file.replace(/index\.(md|markdown)/, 'index.html');
	}
	else {
		var base = path.basename(file.file).replace(/\.(md|markdown)/, '');
		file.dest = path.join(path.dirname(file.file), base, 'index.html');
	}

	// Read data and process it
	fs.readFile(path.join(this.source_dir, file.file), 'utf8', function(err, data) {
		file.contents = data;
		var matches = data.match(/(?:.|\n)*(?:---+\n)\n*/m);

		if (matches) {
			file.headers = matches[0];
			file.contents = file.contents.substr(matches[0].length);
		}

		file.contents = marked(file.contents);

		callback(file);
	});
};

module.exports['markdown'] = module.exports['md'];
