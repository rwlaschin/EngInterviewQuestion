const MemoryStore = require("../../Modules/MemoryStore");
const Util = require("util");

const _path = "facilities.%s";
const _trpath = "facilitiesToId.%s";

/*
    { id: 1, name: 'Luma Mock Facility North' },
*/

module.exports = new function Facilities() {
	/**
	 * Adds/Replaces facility data
	 * @param {*} facility
	 */
	this.sync = async function(facility) {
		let p1 = MemoryStore.insert(Util.format(_path, facility.id), facility);
		let p2 = MemoryStore.insert(Util.format(_trpath, facility.name), facility.id);
		await p1;
		await p2;
	};
	/**
	 * Gets facility data by id
	 * @param {Number} id
	 */
	this.get = async function(id) {
		try {
			return await MemoryStore.get(Util.format(_path, id));
		} catch (e) {
			return {};
		}
	};
	/**
	 * Gets facility data by name
	 * @param {String} name
	 */
	this.getByName = async function(name) {
		try {
			var id = await MemoryStore.get(Util.format(_trpath, name));
			return (await this.get(id)) || {};
		} catch (e) {
			return {};
		}
	};
}();
