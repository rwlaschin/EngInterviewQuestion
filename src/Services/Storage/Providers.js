const MemoryStore = require("../../Modules/MemoryStore");
const Util = require("util");

const _path = "providers.%s";
const _trpath = "providersToId.%s";

/*
    { id: 1,name: 'Doogie Howser', firstname: 'Doogie', lastname: 'Howser' },
    */

module.exports = new function Providers() {
	/**
	 * Adds/Replaces provider information
	 * @param {*} provider provider information
	 */
	this.sync = async function(provider) {
		let p1 = MemoryStore.insert(Util.format(_path, provider.id), provider);
		let p2 = MemoryStore.insert(Util.format(_trpath, provider.name), provider.id);
		await p1, await p2;
	};
	/**
	 * Gets provider information from name
	 * @param {String} name provider name
	 */
	this.getByName = async function(name) {
		var id = await MemoryStore.get(Util.format(_trpath, name));
		return await this.get(id);
	};
	/**
	 * Gets provider information from id
	 * @param {Number} id provider id
	 */
	this.get = async function(id) {
		return await MemoryStore.get(Util.format(_path, id));
	};
}();
