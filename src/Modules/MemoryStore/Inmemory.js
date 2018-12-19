var Promise = require("promise");

var _memoryStore = {};

// This would not be something used in production.  Removing/Adding keys to dictionaries actually
// convert objects into a 'dynamic' object which is slower/bigger than an object with fixed keys.
// Instead a memory store/database should be used for scalability consistency, and robustness.

function MemoryStore() {}

module.exports = new MemoryStore();

/**
 * Add/Replaces data into memory storage, creates a new 'object' in memory as required
 * @param path (string) period ('.') delimited path to final location
 * @param data (object)
 */
MemoryStore.prototype.insert = function(path, data) {
	if (!path || typeof path !== "string") {
		throw new Error("Path is not correct type", path);
	}

	var base = _memoryStore;
	var subpaths = path.split(".");
	subpaths.slice(0, -1).forEach(function(subpath) {
		if (!(subpath in base)) {
			base[subpath] = {};
		}
		base = base[subpath];
	});
	base[subpaths[subpaths.length - 1]] = data;
};

/**
 *  Tests to see if path exists in object
 * @param {String} path  period ('.') delimited path to final location
 * @returns promise/false if object does not exist
 */
MemoryStore.prototype.exists = function(path) {
	return new Promise(function(resolve, reject) {
		if (!path || typeof path !== "string") {
			return reject(new Error("Path is not correct type", path));
		}

		var base = _memoryStore;
		try {
			var subpaths = path.split(".");
			subpaths.forEach(function(subpath) {
				if (!(subpath in base)) {
					throw new Error("Path does not exist", path, subpath);
				}
				base = base[subpath];
			});
			resolve(true);
		} catch (e) {
			resolve(false);
		}
	});
};

/**
 * Looks up object at path
 * @param {String} path period ('.') delimited path to final location
 * @returns undefined or object
 */
MemoryStore.prototype.get = function(path) {
	return new Promise(function(resolve, reject) {
		if (!path || typeof path !== "string") {
			return reject(new Error("Path is not correct type", path));
		}

		var base = _memoryStore;
		try {
			var subpaths = path.split(".");
			subpaths.slice(0, -1).forEach(function(subpath) {
				if (!(subpath in base)) {
					throw new Error("Path does not exist", path, subpath);
				}
				base = base[subpath];
			});
			var subpath = subpaths[subpaths.length - 1];
			if (!(subpath in base)) {
				throw new Error("Path does not exist", path, subpath);
			}
			resolve(base[subpaths[subpaths.length - 1]]);
		} catch (e) {
			// console.log(e);
			resolve(e);
		}
	});
};

/**
 * Removes key at path
 * @param {String} path path to data
 * @out _memoryStore[path] is deleted
 * @return false if key was not deleted or true
 */
MemoryStore.prototype.remove = function(path) {
	return new Promise(function(resolve, reject) {
		if (!path || typeof path !== "string") {
			return reject(new Error("Path is not correct type", path));
		}

		var base = _memoryStore;
		try {
			var subpaths = path.split(".");
			subpaths.slice(0, -1).forEach(function(subpath) {
				if (!(subpath in base)) {
					throw new Error("Subpath missing from data object");
				}
				base = base[subpath];
			});
			var subpath = subpaths[subpaths.length - 1];
			if (!(subpath in base)) {
				throw new Error("Subpath missing from data object");
			}
			delete base[subpaths[subpaths.length - 1]];
			resolve(true);
		} catch (e) {
			resolve(false);
		}
	});
};

/**
 * Removes all data and returns to initial state
 * @out {*} _memoryStore is set to {}
 */
MemoryStore.prototype.reset = function() {
	_memoryStore = {};
};

/**
 * Returns read-only object
 * @param {*} data new object
 */
module.exports._memory = function(data) {
	// this would not normally need to be done because it
	// would connect to an interface
	if (data) {
		_memoryStore = data;
	}
	return _memoryStore;
};
