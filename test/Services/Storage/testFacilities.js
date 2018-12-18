"use strict";

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
chai.should();
chai.use(require("chai-sinon"));

const MemoryStore = require("../../../src/Modules/MemoryStore");

const Module = require("../../../src/Services/Storage/Facilities");

describe("Facilities Module", function() {
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
		it("should insert data to facilities using id", function() {
			var data = { id: 1 };
			Module.sync(data);
			expect(MemoryStore.insert).to.be.calledWith(`facilities.${data.id}`, data);
		});
	});
	context("Get", function() {
		it("should get data using id", function(done) {
			var data = { id: 99, valid: true };
			MemoryStore.get.withArgs("facilities.99").returns(data);
			Module.get(99)
				.then(function(ret) {
					expect(ret).to.eql(data);
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should return empty object if data not found", function(done) {
			var data = { id: 99, valid: true };
			MemoryStore.get.withArgs("facilities.99").returns(undefined);
			Module.get(99)
				.then(function(ret) {
					expect(ret).to.be.empty;
				})
				.catch(function(err) {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should return empty object if exception thrown", function(done) {
			var data = { id: 99, valid: true };
			MemoryStore.get.throws();
			Module.get(95)
				.then(function(ret) {
					expect(ret).to.be.empty;
				})
				.catch(function(err) {
					expect().to.be.true;
				})
				.finally(done);
		});
	});
	context("GetByName", function() {
		before(function() {
			Module.get = sinon.stub(Module, "get");
		});
		afterEach(function() {
			Module.get.resetHistory();
			MemoryStore.get.resetHistory();
		});
		after(function() {
			Module.get.restore();
		});
		it("should get data using id", function(done) {
			var data = { id: 99, valid: true };

			MemoryStore.get.withArgs("facilitiesToId.My Test Name").returns(99);
			Module.get.withArgs(99).returns(data);

			Module.getByName("My Test Name")
				.then(function(ret) {
					expect(ret).to.eql(data);
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should return empty object if data not found", function() {
			MemoryStore.get.onCall(0).returns(1);
			Module.get.withArgs(1).returns(undefined);

			var ret = Module.getByName("Invalid");
			expect(ret).to.be.empty;
		});
		it("should return empty object if exception thrown", function(done) {
			MemoryStore.get.onCall(0).throws();

			Module.getByName("Invalid")
				.then(function(ret) {
					expect(ret).to.be.empty;
				})
				.catch(function() {
					expect().to.be.false;
				})
				.finally(done);
		});
	});
});
