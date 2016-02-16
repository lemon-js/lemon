'use strict';

Array.prototype.forEachCallback = function(callback, finishCallback) {
	var current = 0;
	var self = this;

	var next = function() {
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
	};

	next();
};
