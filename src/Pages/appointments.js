const Route = require("../server.js");
const { Appointments, Facilities, Patients, Providers } = require("../Services/Storage");
const moment = require("moment");

/**
 * Handles presentation of data
 * @param {*} req request object
 * @param {*} res response object
 */
module.exports = async function(req, res) {
	// in production we would use react or another framework
	// this is just for debugging/visualization
	req.query.provider = (req.query.provider || "").replace(/\"/g, "");
	req.query.facility = (req.query.facility || "").replace(/\"/g, "");

	let startMoment = req.query.date ? moment(req.query.date, "YYYY-MM-DD") : moment().startOf("day");
	let schedule = await processInformation(
		startMoment,
		req.query.provider === ""
			? req.query.facility === ""
				? unFiltered
				: facilitiesFilter(req.query.facility)
			: providerFilter(req.query.provider),
	);
	pivotDataToRowFormat(startMoment, schedule);
	writeOutContent(req, res, { schedule: schedule });
};

Route.add("/appointments", module.exports);

/**
 *  No filtering function
 */
function unFiltered() {
	return true;
}

/**
 *  Provider filtering function
 * @param {String} provider name
 * @returns callback
 */
function providerFilter(name) {
	var id = Providers.getByName(name).id;
	if (!id) {
		return unFiltered;
	}
	return function filter(item) {
		return item.provider === id;
	};
}

/**
 *  Facilities filtering function
 * @param {String} facilities name
 * @returns callback
 */
function facilitiesFilter(name) {
	var id = Facilities.getByName(name).id;
	if (!id) {
		return unFiltered;
	}
	return function filter(item) {
		return item.facilities === id;
	};
}

/**
 * Writes and manipulates html
 * @param {*} req request object
 * @param {*} res response object
 * @param {*} data state data
 */
async function writeOutContent(req, res, data) {
	schedule = data.schedule;
	let timeSlots = [];

	for (var i = 0; i < schedule.pivot.length; i++) {
		let day = [],
			slots = schedule.pivot[i];

		timeSlots.push(day);
		day.push(slots[0]); // column name
		for (var j = 1; j < slots.length; j++) {
			let item = slots[j],
				val;

			if (item && !item.isEmpty) {
				val = {
					status: item.status,
					patient: item.patient ? (await Patients.get(item.facility, item.patient)).name : "undefined",
					facility: item.facility ? (await Facilities.get(item.facility)).name : "undefined",
					provider: item.provider ? (await Providers.get(item.provider)).name : "undefined",
				};
			}
			day.push(val);
		}
	}

	res.header("Content-Type", "text/html");
	res.send(`
	<html>
		<header>
			<style>
				tr:nth-child(even) {background: #CCC}
				tr:nth-child(odd) {background: #FFF}
			</style>
		</header>
		<body>
			<h1 align="center">${req.query.provider}</h1>
			<table style="width:100%">
				<tr>
					${schedule.headers
						.map(val => {
							return `<th object="dayField">${val}</th>`;
						})
						.join("")}
				</tr>
				${timeSlots
					.map((day, i) => {
						return `<tr id=${i}>
						${day
							.map((item, j) => {
								// possible for timeslot to have multiple items
								// same slot -- not solving that
								if (j == 0) {
									return `<td object="timeColumn">${item}</td>`;
								}
								if (!item || item.isEmpty) {
									return `<td><div style="width:14%"/></td>`;
								}
								return `<td class="${item.status}">${item.patient} at ${item.facility} with ${
									item.provider
								}</td>`;
							})
							.join("")}
						</tr>`;
					})
					.join("")}
			</table>
		</body>
	</html>
	`);
}

/**
 * Pivots data so it is in the form needed by the HTML table
 * @param {String} provider provider to filter schedule
 * @param {*} startMoment moment time object to start with
 */
async function processInformation(startMoment, filtercb) {
	var schedule = { data: [], headers: ["Times"], pivot: [] };
	var endMoment = moment(startMoment).add("7", "days");
	var promises = [];

	for (let cursor = startMoment; cursor.isBefore(endMoment); cursor.add("1", "days")) {
		let curMoment = cursor.clone();
		var promise = Appointments.get(curMoment.valueOf())
			.then(function(appts) {
				var normalizedAppts = [];
				schedule.headers.push(curMoment.format("dddd"));
				appts = normalizeObjectsToArray(appts || {}).filter(filtercb);
				// order for syncing with empty schedule spots
				appts.sort(compareAppointments);

				for (
					let s = moment(curMoment), e = moment(curMoment).add(1, "days"), workingIndex = 0;
					s.isBefore(e);
					s.add(30, "minutes")
				) {
					if (appts.length > workingIndex && s.isSame(appts[workingIndex].date)) {
						normalizedAppts.push(appts[workingIndex]);
						workingIndex++;
						s.subtract(30, "minutes");
						continue;
					}
					normalizedAppts.push({ date: moment(s), isEmpty: true });
				}
				schedule.data.push(normalizedAppts);
			})
			.catch(function(err) {
				console.error(err);
			});
		promises.push(promise);
	}
	for (var i = 0; i < promises.length; i++) {
		await promises[i];
	}
	return schedule;
}

/**
 * Pivots data so it is in the form needed by the HTML table
 * @param {*} startMoment moment time object to start with
 * @param {*} schedule data structure with pivot data
 */
function pivotDataToRowFormat(startMoment, schedule) {
	for (
		var i = 0, l = schedule.data[0].length, deltaMoment = moment(startMoment);
		i < l;
		i++, deltaMoment.add(30, "minutes")
	) {
		var columnData = [deltaMoment.format("hh:mm")];
		for (var j = 0, e = 7; j < e; j++) {
			if (!schedule.data[j]) continue;
			columnData.push(schedule.data[j][i]);
		}
		schedule.pivot.push(columnData);
	}
	return schedule;
}

/**
 * Turns object into array and sets the milliseconds to zero
 * @param {*} appointments appointment data
 */
function normalizeObjectsToArray(appointments) {
	appointments = Object.keys(appointments).map(k => appointments[k]);
	appointments.forEach(item => {
		item.date.milliseconds(0);
	});
	return appointments;
}

/**
 * Comparison routine for appointment objects
 * @param {*} a appointment data
 * @param {*} b appointment data
 */
function compareAppointments(a, b) {
	if (a.date.isBefore(b.date)) return -1;
	if (a.date.isAfter(b.date)) return 1;
	return 0;
}
