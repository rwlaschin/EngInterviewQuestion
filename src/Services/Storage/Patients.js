const MemoryStore = require("../../Modules/MemoryStore");
const Util = require("util");
const _ = require("lodash");

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
	 * Report differences between new and current data
	 * remove deleted fields, except for patient id
	 * @param {*} local locally cached data
	 * @param {*} remote 3rd party remove data
	 * @param {*} status reporting object
	 */
	this.recordDifferences = function(local, remote, status) {
		var seen = {};
		if (local.message !== undefined) {
			status.diffs = Object.keys(remote).join();
			return remote;
		}
		(status.created = false), (status.diffs = []);
		Object.keys(remote).forEach(key => {
			seen[key] = true;
			if (!(key in local)) {
				status.diffs.push(` (+) ${key} ${local[key]} -> ${remote[key]}`);
			} else if (!_.isEqual(local[key], remote[key])) {
				status.diffs.push(` (m) ${key} ${remote[key]}`);
			}
		});
		Object.keys(local).forEach(key => {
			if (!(key in seen)) {
				status.diffs.push(` (-) ${key} ${local[key]}`);
				if (key !== "patient") delete local[key];
			}
		});
		return Object.assign(local, remote);
	};

	/**
	 *  Add/Replace data into storage area
	 * @param {Number} fid account facility id
	 * @param {Number} pid account patient id
	 * @param {*} patient
	 * @returns {Bool,*} when fid,pid is missing skip, otherwise return status object
	 */
	this.sync = async function(fid, pid, patient) {
		if (!fid || !pid) {
			return false;
		}
		var status = { created: false, diffs: "" };
		try {
			var current = await this.get(fid, pid);
			patient = this.recordDifferences(current, patient, status);
			await MemoryStore.insert(Util.format(_path, fid, pid), patient);
		} catch (e) {}
		return status;
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
