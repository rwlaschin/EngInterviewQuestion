const Moment = require("moment");
const Util = require("util");

const MemoryStore = require("../../Modules/MemoryStore");

const _rootpath = "appointments.%s";
const _path = _rootpath + ".%s";

/* {
    id: i,
    patient: Number,
    provider: Number,
    type: Number,
    facility: Number,
    duration: Number (Minutes),
    status: getRandomStatus(),
    date: 123412344
} */
module.exports = new function Appointments() {
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
				status.diffs.push(` (+) ${key} ${remote[key]}`);
			} else if (local[key] != remote[key]) {
				status.diffs.push(` (m) ${key} ${local[key]} -> ${remote[key]}`);
			}
		});
		Object.keys(local).forEach(key => {
			if (!(key in seen)) {
				status.diffs.push(` (-) ${key} ${local[key]}`);
			}
		});
		return remote;
	};

	/**
	 * Add or Update new Appointment Information
	 * @param {*} appointment
	 * @returns {*} status  {created {bool}, diffs {array} }
	 */
	this.sync = async function(appointment) {
		var status = { created: true, diffs: "" };
		const timestamp = Moment(appointment.date, "x")
			.startOf("day")
			.valueOf();

		const key = Util.format(_path, timestamp, appointment.id);
		try {
			var current = await MemoryStore.get(key);
			appointment = this.recordDifferences(current, appointment, status);
			await MemoryStore.insert(key, appointment);
		} catch (e) {}
		return status;
	};
	/**
	 * Get all appointments by time
	 * @param {Number} timestamp unit timestamp (UTC)
	 * @returns {*} data
	 */
	this.get = async function(timestamp) {
		try {
			return await MemoryStore.get(Util.format(_rootpath, timestamp));
		} catch (e) {
			return {};
		}
	};
	/**
	 * Remove old data by date
	 * @param {Number} timestamp unix timestamp (UTC)
	 */
	this.remove = function(timestamp) {
		// walk through all of the appointments added during this day and remove
		MemoryStore.remove(Util.format(_rootpath, timestamp));
	};
}();
