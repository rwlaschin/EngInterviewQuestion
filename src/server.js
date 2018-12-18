"use strict";

const fastify = require("fastify")({ logger: false });
const port = process.env.PORT;

fastify.register(require("fastify-cors"), {
	origin: true,
	methods: "GET",
	allowedHeaders: [
		"Origin",
		"X-Requested-With",
		"Content-Type",
		"Accept",
		"X-Access-Token"
	],
	credentials: true
})

const start = async () => {
	try {
		await fastify.listen(port);
		fastify.log.info(`server listening on ${fastify.server.address().port}`);
	} catch (e) {
		fastify.log.error(e);
	}
};
start();

module.exports = new function() {
	/**
	 * Allows adding routes to server
	 */
	this.add = (url, callback) => {
		// simple for example only
		url = url.replace(/^([^\/])/, "/$1");
		console.info("Route: ", url);
		fastify.get(url, callback);
	};
}();
