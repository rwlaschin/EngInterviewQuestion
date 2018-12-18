const Routes = require("./server.js");
const LumaMock = require("./Mock/luma-mock.js");
const moment = require("moment");
const { Appointments, Facilities, Patients, Providers } = require("./Services/Storage");

const lumaMock = new LumaMock();

/*
Must pull data from LumaMock class (given) frequently (every 10 seconds) for a specific start and end date range
Data sync data must go from now to six months in the future
Data sync must follow the order - facilities , providers, appointment, patients
Data synchronized must be stored in memory and output logs to stdout
If data is already known, must provide a way to diff 2 versions where the Hospital version always wins.
*/

/**
 * Next time data will be pulled from 3rd party servers
 */
var _nextPullTime;

/**
 * Class definition, exposes start,stop functions to control synchronization
 */
function sync() {
	/**
	 * Interval timer id
	 */
	var interval;

	/**
	 * Starts the periodic update manager
	 * @out _nextPullTime resets/clears next update delta
	 *      interval stores interval id for managing
	 */
	this.start = () => {
		if (!interval) {
			interval = setInterval(pull, 100);
			_nextPullTime = Date.now();
		}
	};
	/**
	 * Stops the periodic update manager
	 * @out _nextPullTime resets/clears next update delta
	 */
	this.stop = () => {
		if (interval) {
			clearInterval(interval);
			interval = undefined;
		}
	};

	if (process.env.START) {
		this.start();
	}
}

/**
 * Handles periodic updates to data (pump routine)
 * @out External Memory storage and Dump to Standard out
 */
async function pull() {
	if (_nextPullTime >= Date.now()) {
		return;
	}
	// This doesn't work when daylight savings time happens
	// in fact setInterval/setTimeout do not work properly when
	// the system changes time.
	_nextPullTime = Date.now() + (process.env.updatePeriodSeconds * 1000 || 10000);

	await syncFacilities();
	await syncProviders();
	await syncAppointments();
	await cleanUpStoredData();
}

/**
 * Pulls now to 6mos out appointments
 * @out adds data to storage
 */
async function syncFacilities() {
	await lumaMock.getFacilities(async (err, facilities) => {
		if (err) {
			return;
		}
		await facilities.forEach(async facility => {
			await Facilities.sync(facility);
			console.log(`facility ${facility.name}`);
		});
	});
}

/**
 * Pulls now to 6mos out appointments
 * @out adds data to storage
 */
async function syncProviders() {
	await lumaMock.getProviders(async (err, providers) => {
		if (err) {
			return;
		}
		providers.forEach(async provider => {
			await Providers.sync(provider);
			console.log(`provider ${provider.name}`);
		});
	});
}

/**
 * Pulls now to 6mos out appointments
 * @out adds data to storage
 */
function syncAppointments() {
	var endMoment = moment().add(6, "months"),
		promises = [];
	for (let current = moment(); current.isBefore(endMoment); current.add(11, "days")) {
		let startMoment = current.clone();
		let endMoment = moment(current, "x").add(10, "days");
		// @info message queue to batch these out for performance improvement
		//       however, it is possible to overload the 3rd party servers
		//       or hit frequence caps
		getAppointments(startMoment, endMoment);
	}
}

/**
 * Deletes historical data
 * @out removes data from memory storage
 */
function getAppointments(startDate, endDate) {
	lumaMock.getAppointments(startDate, endDate, (err, appointments) => {
		if (err) {
			return;
		}
		appointments.forEach(appointment => {
			lumaMock.getPatient(appointment.patient, appointment.facility, async (err, patient) => {
				if (err) {
					return;
				}
				var pstat = await Patients.sync(appointment.facility, appointment.patient, patient);
				var astat = await Appointments.sync(appointment);
				console.log(
					`appointment ${appointment.date} ${astat.diffs}\n` +
						`  patient ${patient.name} ${pstat ? pstat.diffs : ""}`,
				);
			});
		});
	});
}

/**
 * Deletes historical data
 * @out removes data from memory storage
 */
function cleanUpStoredData() {
	Appointments.remove(
		moment()
			.startOf("day")
			.valueOf(),
	);
}

module.exports = new sync();
