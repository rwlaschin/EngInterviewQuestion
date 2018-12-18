"use strict";

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
chai.should();
chai.use(require("chai-sinon"));

var Moment = require("Moment");
const MemoryStore = require("../../../src/Modules/MemoryStore");

const Module = require("../../../src/Services/Storage/Appointments");

describe("Appointments Module", function() {
	before(function() {
		MemoryStore.insert = sinon.stub(MemoryStore, "insert");
		MemoryStore.remove = sinon.stub(MemoryStore, "remove");
		MemoryStore.get = sinon.stub(MemoryStore, "get");
	});
	afterEach(function() {
		MemoryStore.insert.resetHistory();
		MemoryStore.remove.resetHistory();
		MemoryStore.get.resetHistory();
	});
	after(function() {
		MemoryStore.insert.restore();
		MemoryStore.remove.restore();
		MemoryStore.get.restore();
	});
	context("Exports", function() {
		it("should export object", function() {
			expect(Module).to.be.an("object");
		});
		it("should export remove function", function() {
			expect(Module.remove).to.be.a("function");
		});
	});
	context("Sync", function() {
		it("should insert data to appointments using timestamp,date, and id", function() {
			var data = { id: 1, date: Moment().valueOf() };
			var startOfToday = Moment(data.date, "x")
				.startOf("day")
				.valueOf();

			Module.sync(data);

			expect(MemoryStore.insert).to.be.calledWith(`appointments.${startOfToday}.${data.id}`, data);
		});
	});
	context("Remove", function() {
		it("should remove data from appointments using timestamp", function() {
			var startOfToday = Moment()
				.startOf("day")
				.valueOf();
			Module.remove(startOfToday);
			expect(MemoryStore.remove).to.be.calledWith(`appointments.${startOfToday}`);
		});
	});
	context("Get", function() {
		it("should get data from appointments using date", function() {
			var startOfToday = Moment()
				.startOf("day")
				.valueOf();
			Module.get(startOfToday);
			expect(MemoryStore.get).to.be.calledWith(`appointments.${startOfToday}`);
		});
		it("should return empty object if exception is thrown", function(done) {
			MemoryStore.get.throws("Test Error");
			var startOfToday = Moment()
				.startOf("day")
				.valueOf();
			Module.get(startOfToday)
				.then(function(ret) {
					expect(MemoryStore.get).to.be.calledWith(`appointments.${startOfToday}`);
					expect(ret).to.be.empty;
				})
				.catch(function(err) {
					expect(err).to.not.throw();
				})
				.finally(done);
		});
	});
});
