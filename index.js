'use strict';

var fs = require('fs');
var path = require('path');
var tiptoe = require('tiptoe');

Array.prototype.forEachCallback = function(callback, finishCallback) {
	var current = 0;
	var self = this;

	function next() {
		if (!self) {
			console.log("Something went wrong...");
			throw('No self!');
			return;
		}
		if (current >= self.length) {
			if (finishCallback) {
				var cb = finishCallback.bind(self);
				cb();
			}
			return;
		}

		var currentItem = self[current++];
		
		var cb = callback.bind(currentItem);
		cb(currentItem, next);
	}

	next();
};

/**
 * Traverse filesystem (Async)
 * @param tPath String with the path to walk
 * @param filecallback Function to call on each file
 * @param callback Function to call when finished.
 */
function traverseFS(tPath, filecallback, callback) {

	var traverse = function(cPath, next) {
		fs.readdir(cPath, function(err, files) {
			if (!files) {
				next();
				return;
			}

			files.forEachCallback(function (file, cb) {
				var fn = path.join(cPath, file);
				fs.stat(fn, function(err, stat) {
					if (stat.isDirectory()) {
						traverse(fn, cb);
					}
					else {
						filecallback(fn);
						cb();
					}
				});
			},
			next);
		});
	};

	traverse(tPath, callback);
};

/**
 * Base function. Create a new 'lemon' object to get started.
 */
var lemon = function(baseDir) {
	baseDir = baseDir || process.cwd();

	this.config_file = path.join(baseDir, 'site.json');
	this.public_dir = path.join(baseDir, 'public');
	this.source_dir = path.join(baseDir, 'source');
	this.template_dir = path.join(baseDir, 'templates');
};

lemon.prototype.init = function(callback) {
	callback();
};

lemon.prototype.load = function(callback) {
	var juice = this;
	var files = [];

	// Process each entry on folders
	var fileProcessor = function(fn) {
		var f = fn.replace(juice.source_dir, '');
		var obj = {
			file: f,
			ext: path.extname(f).toLowerCase()
		};

		// No initial "."
		if (obj.ext.length > 0)
			obj.ext = obj.ext.substr(1);

		files.push(obj);
	};

	var finish = function() {
		juice.files = files;
		callback();
	};

	traverseFS(this.source_dir, fileProcessor, finish);
};

lemon.prototype.process = function(callback) {
	var juice = this;

	tiptoe(
		function() {
			juice.files.forEachCallback(function(fn, cb) {
				//var extname = path.extname(fn).toLowerCase();

				cb();
			},
			this);
		},
		function finish(err) {
			callback(err);
		}
	);
};

lemon.prototype.generate = function(callback) {
	var juice = this;

	tiptoe(
		function() {
			var next = this;
			fs.mkdir(juice.public_dir, function(err) {
				if (err) {
					if (err.code != 'EEXIST') {
						next(err);
						return;
					}
				}

				next();
			});
		},
		function() {
			juice.files.forEachCallback(function(file, cb) {
				var source = path.join(juice.source_dir, file.file);
				var destination = path.join(juice.public_dir, file.file);
				console.log('%s -> %s', source, destination);
				cb();
			},
			this);
		},
		function finish(err) {
			callback(err);
		}
	);
};

module.exports = lemon;
