const Router = require("../server.js");
const MemoryStore = require("../Modules/MemoryStore");

module.exports = function(req, res) {
	/**
	 * Add route to look at the current memory
	 */
	try {
		res.send(JSON.stringify(MemoryStore._memory(), undefined, 3));
		res.send("OK");
	} catch (e) {
		res.code(500);
		res.send("FAIL");
	}
};

Router.add("/dump", module.exports);
