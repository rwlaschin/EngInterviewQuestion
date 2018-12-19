function loadModule() {
	var Module;
	/* istanbul ignore next */
	switch (process.env.MEMORYSTORE) {
		case "redis":
			Module = require("./Redis");
			break;
		default:
			Module = require("./Inmemory");
			break;
	}
	return Module;
}

module.exports = loadModule();
