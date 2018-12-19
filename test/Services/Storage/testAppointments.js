"use strict";

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
chai.use(require("chai-sinon"));
chai.use(require("chai-as-promised"));

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
	context("Sync", function() {
		it("should insert data to appointments using timestamp,date, and id", function() {
			var data = { id: 1, date: Moment().valueOf() };

			MemoryStore.get.returns(data);
			MemoryStore.insert.resolves(data);

			var result = Module.sync(data);
			return expect(result).to.eventually.become({ created: false, diffs: [] });
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
		context("Record Differences", function() {
			it("should return remote when new", function() {
				var remote = { a: 1 },
					status = {};
				var result = Module.recordDifferences(new Error("Test Error"), remote, status);
				expect(result).to.equal(remote);
				expect(status).to.eql({ diffs: [" (+) a 1"] });
			});
			it("should merge remote with existing", function() {
				var remote = { a: 1 },
					existing = { b: 2 },
					status = {};
				var result = Module.recordDifferences(existing, remote, status);
				expect(result).to.equal(remote);
				expect(status).to.eql({ created: false, diffs: [" (+) a 1", " (-) b 2"] });
			});
			it("should record modified fields", function() {
				var remote = { c: 3 },
					existing = { c: 2 },
					status = {};
				var result = Module.recordDifferences(existing, remote, status);
				expect(result).to.equal(remote);
				expect(status).to.eql({ created: false, diffs: [" (m) c 2 -> 3"] });
			});
			it("should record missing fields", function() {
				var remote = {},
					existing = { b: 2 },
					status = {};
				var result = Module.recordDifferences(existing, remote, status);
				expect(result).to.equal(remote);
				expect(status).to.eql({ created: false, diffs: [" (-) b 2"] });
			});
		});
	});
});
