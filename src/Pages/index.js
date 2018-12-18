module.exports = require("require-all")({
	dirname: __dirname,
	filter: /^((?!index).*)\.js.?$/,
	excludeDirs: /^\.(git|svn)$/,
	recursive: false,
	resolve: function(Controller) {
		return Controller;
	}
});