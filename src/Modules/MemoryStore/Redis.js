var Redis = require("ioredis");
var moment = require("moment");

var client = new Redis({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT,
	auth: process.env.REDIS_PASSWORD,
	enableReadyCheck: true,
	enableOfflineQueue: true, // this can break things
});

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

	return client.set(path, JSON.stringify(data), "ex", process.env.DEFAULT_EXPIRE_SECONDS || 31557600);
};

/**
 *  Tests to see if path exists in object
 * @param {String} path  period ('.') delimited path to final location
 * @returns promise/false if object does not exist
 */
MemoryStore.prototype.exists = function(path) {
	if (!path || typeof path !== "string") {
		throw new Error("Path is not correct type", path);
	}
	return client.exists(path);
};

/**
 * Looks up object at path
 * @param {String} path period ('.') delimited path to final location
 * @returns undefined or object
 */
MemoryStore.prototype.get = async function(path, exact = true) {
	if (!path || typeof path !== "string") {
		throw new Error("Path is not correct type", path);
	}
	let keys = exact ? [path] : await client.keys(path + "*");
	let batch = client.pipeline();
	keys.forEach(key => {
		batch.get(key);
	});
	return batch.exec().then(function(results) {
		var resultAsObject = {};
		results.forEach((response, i) => {
			let [err, result] = response;
			try {
				if (!err) {
					let parsed = JSON.parse(result);
					if (parsed.date) parsed.date = moment(parsed.date);
					if (exact) resultAsObject = parsed;
					else resultAsObject[keys[i]] = parsed;
				}
			} catch (e) {
				console.log("Error", result, e);
			}
		});
		return resultAsObject;
	});
};

/**
 * Removes key at path
 * @param {String} path path to data
 * @out _memoryStore[path] is deleted
 * @return false if key was not deleted or true
 */
MemoryStore.prototype.remove = async function(path, exact = true) {
	if (!path || typeof path !== "string") {
		throw new Error("Path is not correct type", path);
	}
	let keys = exact ? [path] : await client.keys(path + "*");
	let batch = client.pipeline();
	keys.forEach(key => {
		batch.del(key);
	});
	return batch.exec();
};

/**
 * Removes all data and returns to initial state
 * @out {*} _memoryStore is set to {}
 */
MemoryStore.prototype.reset = function() {
	throw new Error("Not supported by Redis Interface");
};

/**
 * Returns read-only object
 * @param {*} data new object
 */
module.exports._memory = function(data) {
	throw new Error("Not supported by Redis Interface");
};
