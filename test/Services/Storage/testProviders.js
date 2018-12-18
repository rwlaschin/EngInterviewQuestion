"use strict";

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
chai.should();
chai.use(require("chai-sinon"));

const MemoryStore = require("../../../src/Modules/MemoryStore");

const Module = require("../../../src/Services/Storage/Providers");

describe("Providers Module", function() {
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
		it("should insert data to providers using id", function() {
			var data = { id: 1, name: "test provider" };
			Module.sync(data);
			expect(MemoryStore.insert).to.be.calledWith(`providers.${data.id}`, data);
		});
	});
	context("GetByName", function() {
		it("should get data from providers using existing name", function(done) {
			var name = "test provider";
			MemoryStore.get.withArgs(`providersToId.${name}`).returns(1);

			Module.getByName(name)
				.then(function(val) {
					expect(MemoryStore.get).to.be.calledWith(`providersToId.${name}`);
					expect(MemoryStore.get).to.be.calledWith("providers.1");
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
	});

	context("Get", function() {
		it("should get data from providers using existing id", function(done) {
			var data = { id: 1, name: "Test Provider" };
			MemoryStore.get.withArgs("providers.1").returns(data);

			var val = Module.get(1)
				.then(function(val) {
					expect(MemoryStore.get).to.be.calledWith("providers.1");
					expect(val).to.eql(data);
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
	});
});
