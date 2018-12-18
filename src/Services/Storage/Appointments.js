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
	 * Add or Update new Appointment Information
	 * @param {*} appointment
	 */
	this.sync = async function(appointment) {
		// In production utc which is not effected by daylights savings time
		const timestamp = Moment(appointment.date, "x")
			.startOf("day")
			.valueOf();
		await MemoryStore.insert(Util.format(_path, timestamp, appointment.id), appointment);
	};
	/**
	 * Get all appointments by time
	 * @param {Number} timestamp unit timestamp (UTC)
	 */
	this.get = async function(timestamp) {
		try {
			return (await MemoryStore.get(Util.format(_rootpath, timestamp))) || {};
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
