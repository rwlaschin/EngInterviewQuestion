const MemoryStore = require("../../Modules/MemoryStore");
const Util = require("util");

const _path = "patients.%s.%s";

/*
    "Marnie TheDog": {
		"name": "Marnie TheDog",
		"firstname": "Marnie",
		"lastname": "TheDog",
		"id": 1,
		"dateOfBirth": "1981-06-07T07:00:00.000Z",
		"contact": [
		{
			"type": "sms",
			"value": "+1 949-555-1234"
		},
		{
			"type": "email",
			"value": "aditya+lumamock@lumahealth.io"
		}
		]
	}
*/

module.exports = new function Patients() {
	/**
	 *  Add/Replace data into storage area
	 * @param {Number} fid account facility id
	 * @param {Number} pid account patient id
	 * @param {Object} patient
	 */
	this.sync = async function(fid, pid, patient) {
		if (!fid || !pid) {
			return false;
		}
		try {
			var current = await this.get(fid, pid);
			await MemoryStore.insert(Util.format(_path, fid, pid), Object.assign(current, patient));
		} catch (e) {
			return false;
		}
		return true;
	};
	/**
	 * Gets facility data by id
	 * @param {Number} fid account facility id
	 * @param {Number} pid account patient id
	 */
	this.get = async function(fid, pid) {
		return (await MemoryStore.get(Util.format(_path, fid, pid))) || {};
	};
}();
