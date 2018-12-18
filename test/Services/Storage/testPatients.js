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
		it("should insert data to patients using id", function(done) {
			var data = { id: "1" };
			Module.sync(1, 2, data)
				.then(function(val) {
					expect(val).to.be.true;
					expect(MemoryStore.insert).to.be.calledWith("patients.1.2", data);
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should update existing patient with matching id", function(done) {
			var data = { id: 1, name: "Test Donkey" },
				cur = { id: 1, field: "existing" };

			MemoryStore.get.withArgs("patients.1.2").returns(cur);
			Module.sync(1, 2, data)
				.then(function(val) {
					expect(val).to.be.true;
					expect(MemoryStore.get).to.be.calledWith("patients.1.2");
					expect(MemoryStore.insert).to.be.calledWith("patients.1.2", Object.assign({}, cur, data));
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
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
		it("should not insert data when throws error", function(done) {
			var data = { id: 1, name: "Test Donkey" };
			MemoryStore.insert.throws();
			Module.sync(1, 2, data)
				.then(function(val) {
					expect(val).to.be.false;
				})
				.catch(function(err) {
					expect(err).to.not.throw();
				})
				.finally(done);
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
});
