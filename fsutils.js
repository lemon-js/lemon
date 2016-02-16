'use strict';

/**
 * This module adds the following functions to the standard 'fs' package:
 *
 * * mkdirParent (like `mkdir -p`)
 * * copyFile 
 * * traverse - go trough each file in the given path recursively.
 */

var fs = require('fs');
var path = require('path');
require('./arrayutils');

// Adapted from: http://lmws.net/making-directory-along-with-missing-parents-in-node-js
fs.mkdirParent = function(dirPath, mode, callback) {
	if (!callback && typeof(mode) == 'function') {
		callback = mode;
		mode = 0o777;
	}

	if (!mode) {
		mode = 0o777;
	}
	//Call the standard fs.mkdir
	fs.mkdir(dirPath, mode, function(error) {
		//When it fail in this way, do the custom steps
		if (error && error.errno === 34) {
			//Create all the parents recursively
			fs.mkdirParent(path.dirname(dirPath), mode, callback);
			//And then the directory
			fs.mkdirParent(dirPath, mode, callback);
		}
		//Manually run the callback since we used our own callback to do all these
		callback && callback(error);
	});
};

// Adapted from: http://stackoverflow.com/a/14387791/488212
fs.copyFile = function(source, destination, callback) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});

	var wr = fs.createWriteStream(destination);
	wr.on("error", function(err) {
		done(err);
	});
	wr.on("close", function(ex) {
		done();
	});

	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cbCalled = true;
			callback(err);
		}
	}
};

/**
 * Traverse filesystem (Async)
 * @param tPath String with the path to walk
 * @param filecallback Function to call on each file
 * @param callback Function to call when finished.
 */
fs.traverse = function(tPath, filecallback, callback) {

	// Callback to invoke on each folder
	var traverse = function(cPath, next) {
		fs.readdir(cPath, function(err, files) {
			if (!files) {
				next();
				return;
			}

			// Process each file
			files.forEachCallback(function (file, cb) {
				var fn = path.join(cPath, file);
				fs.stat(fn, function(err, stat) {
					if (stat.isDirectory()) {
						traverse(fn, cb);	// Recall ourselves if we found a directory
					}
					else {
						filecallback(fn);		// Calls the file manipulator callback
						cb();
					}
				});
			},
			next);
		});
	};

	// Starts with the given path
	traverse(tPath, callback);
};

module.exports = fs;
