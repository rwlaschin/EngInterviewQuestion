"use strict";

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
chai.should();
chai.use(require("chai-sinon"));

const MemoryStore = require("../../../src/Modules/MemoryStore");

const Module = require("../../../src/Services/Storage/Patients");

describe("Patients Module", function() {
	before(function() {
		MemoryStore.insert = sinon.stub(MemoryStore, "insert");
		MemoryStore.get = sinon.stub(MemoryStore, "get");
	});
	afterEach(function() {
		MemoryStore.insert.resetHistory();
		MemoryStore.get.resetHistory();
	});
	after(function() {
		MemoryStore.insert.restore();
		MemoryStore.get.restore();
	});
	context("Exports", function() {
		it("should export object", function() {
			expect(Module).to.be.an("object");
		});
	});
	context("Sync", function() {
		it("should insert data to patients using id", function() {
			var data = { id: "1" };
			var result = Module.sync(1, 2, data);
			return expect(result).to.eventually.become.true;
		});
		it("should update existing patient with matching id", function() {
			var data = { id: 1, name: "Test Donkey" },
				cur = { id: 1, field: "existing" };

			MemoryStore.get.withArgs("patients.1.2").returns(cur);
			var result = Module.sync(1, 2, data);
			return expect(result).to.eventually.become.true;
		});
		it("should not insert data when missing facility id", function(done) {
			var data = {};
			Module.sync(undefined, 2, data)
				.then(function(val) {
					expect(val).to.be.false;
					expect(MemoryStore.insert).not.to.be.called;
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should not insert data when missing patient id", function(done) {
			var data = {};
			Module.sync(1, undefined, data)
				.then(function(val) {
					expect(val).to.be.false;
					expect(MemoryStore.insert).not.to.be.called;
				})
				.catch(function() {
					expect().to.be.false;
				})
				.finally(done);
		});
		it("should not insert data when throws error", function() {
			var data = { id: 1, name: "Test Donkey" };
			MemoryStore.insert.throws();
			var result = Module.sync(1, 2, data);
			return expect(result).to.eventually.be.false;
		});
	});
	context("Get", function() {
		afterEach(function() {
			MemoryStore.get.resetHistory();
		});
		it("should return patient with matching id", function(done) {
			var data = { patients: { 99: { 98: { id: 1, valid: true } } } };
			MemoryStore.get.withArgs("patients.99.98").returns(data.patients[99][98]);
			Module.get(99, 98)
				.then(function(ret) {
					expect(ret).to.equal(data.patients[99][98]);
					expect(MemoryStore.insert).not.to.be.called;
				})
				.catch(function() {
					expect().to.be.false;
				})
				.finally(done);
		});
	});
	context("Record Differences", function() {
		it("should return remote when new", function() {
			var remote = { a: 1 },
				status = {};
			var result = Module.recordDifferences(new Error("Test Error"), remote, status);
			expect(result).to.equal(remote);
			expect(status).to.eql({ diffs: "a" });
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
