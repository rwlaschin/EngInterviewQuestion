const Router = require("../server.js");
const Sync = require("../sync-engine.js");

module.exports = function(req, res) {
	try {
		Sync.stop();
		res.send("OK");
	} catch (e) {
		res.code(500);
		res.send("FAIL");
	}
};

Router.add("/stop", module.exports);
