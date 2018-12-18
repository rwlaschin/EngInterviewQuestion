"use strict";

var chai = require("chai");
var expect = chai.expect;
chai.should();
chai.use(require("chai-sinon"));

const Module = require("../../../src/Modules/MemoryStore");

describe("MemoryStore Module", function() {
	beforeEach(function() {
		Module.reset();
	});
	context("Exports", function() {
		it("should export object", function() {
			expect(Module).to.be.an("object");
		});
		it("should export insert function", function() {
			expect(Module.insert).to.be.a("function");
		});
		it("should export get function", function() {
			expect(Module.get).to.be.a("function");
		});
		it("should export exists function", function() {
			expect(Module.exists).to.be.a("function");
		});
		it("should export remove function", function() {
			expect(Module.remove).to.be.a("function");
		});
		it("should export reset function", function() {
			expect(Module.reset).to.be.a("function");
		});
	});
	context("Add", function() {
		it("should throw error for undefined path", function() {
			expect(function() {
				Module.insert(undefined, {});
			}).throws("Path is not correct type");
		});
		it("should throw error for path that is not string", function() {
			expect(function() {
				Module.insert({}, {});
			}).throws("Path is not correct type");
		});
		it("should add data to memory store at path level1", function() {
			var data = "added level1";
			Module.insert("level1", data);
			expect(Module._memory().level1).to.equal(data);
		});
		it("should add data to memory store at path level1.level2", function() {
			var data = "added level2";
			Module.insert("level1.level2", data);
			expect(Module._memory().level1.level2).to.equal(data);
		});
		it("should replace data to memory store at path level1.level2", function() {
			var data = "added new";
			Module._memory({ level1: { level3: "current old" } });
			Module.insert("level1.level3", data);
			expect(Module._memory().level1.level3).to.equal(data);
		});
	});
	context("Exists", function() {
		it("should throw error for undefined path", function(done) {
			Module.exists(undefined)
				.then(function(response) {
					expect(false).to.be.true;
				})
				.catch(function(err) {
					expect(err).throws("Path is not correct type");
				})
				.finally(done);
		});
		it("should throw error for path that is not string", function(done) {
			Module.exists({})
				.then(function(response) {
					expect(false).to.be.true;
				})
				.catch(function(err) {
					expect(err).throws("Path is not correct type");
				})
				.finally(done);
		});
		it("should return true using valid path", function(done) {
			Module._memory({ level1: { level2: { exists: true } } });
			Module.exists("level1.level2.exists")
				.then(function(response) {
					expect(response).to.be.true;
				})
				.catch(function(err) {
					expect(false).to.be.true;
				})
				.finally(done);
		});
		it("should return false using invalid path", function(done) {
			Module._memory({ level1: { level2: { exists: true } } });
			Module.exists("notexist1.notexists2.exists")
				.then(function(response) {
					expect(response).to.be.false;
				})
				.catch(function(err) {
					expect(false).to.be.true;
				})
				.finally(done);
		});
		it("should return false using invalid path and empty object", function(done) {
			Module.exists("notexist1.notexists2.exists")
				.then(function(response) {
					expect(response).to.be.false;
				})
				.catch(function(err) {
					expect(false).to.be.true;
				})
				.finally(done);
		});
	});
	context("Get", function() {
		it("should throw error for undefined path", function(done) {
			Module.get(undefined)
				.then(function() {
					expect().to.be.true;
				})
				.catch(function(err) {
					expect(err).throws("Path is not correct type");
				})
				.finally(done);
		});
		it("should throw error for path that is not string", function(done) {
			Module.get({})
				.then(function() {
					expect().to.be.true;
				})
				.catch(function(err) {
					expect(err).throws("Path is not correct type");
				})
				.finally(done);
		});
		it("should return data using valid path", function(done) {
			Module._memory({ item: "exists" });
			Module.get("item")
				.then(function(response) {
					expect(response).to.equal("exists");
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should return item for valid subpath", function(done) {
			Module._memory({ level1: { level2: "exists" } });
			Module.get("level1.level2")
				.then(function(response) {
					expect(response).to.be.equal("exists");
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should not return data using invalid path", function(done) {
			Module._memory({ item: "exists" });
			Module.get("item2")
				.then(function(response) {
					expect(response).to.be.undefined;
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should return undefined for subpath that does not exist", function(done) {
			Module.get("this.does.not.exist")
				.then(function(response) {
					expect(response).to.be.undefined;
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
	});
	context("Remove", function() {
		it("should throw error for undefined path", function(done) {
			Module.remove(undefined)
				.then(function() {
					expect().to.be.true;
				})
				.catch(function(err) {
					expect(err).throws("Path is not correct type");
				})
				.finally(done);
		});
		it("should throw error for path that is not string", function(done) {
			Module.remove({})
				.then(function() {
					expect().to.be.true;
				})
				.catch(function(err) {
					expect(err).throws("Path is not correct type");
				})
				.finally(done);
		});
		it("should remove data at path remove1", function(done) {
			Module._memory({ remove1: "removed" });
			Module.remove("remove1")
				.then(function(response) {
					expect(response).to.be.true;
					expect(Module._memory().remove1).to.be.undefined;
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should remove data at path", function(done) {
			Module._memory({ keep: { remove2: "removed" } });
			Module.remove("keep.remove2")
				.then(function(response) {
					expect(response).to.be.true;
					expect(Module._memory().keep).to.be.an("object");
					expect(Module._memory().keep.remove2).to.be.undefined;
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should return false at last invalid subpath", function(done) {
			Module._memory({ keep: { keep1: { keep2: true } } });
			Module.remove("keep.remove3")
				.then(function(response) {
					expect(response).to.be.false;
					expect(Module._memory().keep).to.be.an("object");
					expect(Module._memory().keep.keep1).to.be.an("object");
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
		it("should return false at middle invalid subpath", function(done) {
			Module._memory({ keep: { keep1: { keep2: true } } });
			Module.remove("remove.keep1")
				.then(function(response) {
					expect(response).to.be.false;
					expect(Module._memory().keep).to.be.an("object");
					expect(Module._memory().keep.keep1).to.be.an("object");
				})
				.catch(function() {
					expect().to.be.true;
				})
				.finally(done);
		});
	});
	context("Reset", function() {
		it("should reset storage object", function() {
			Module._memory({ keep: { remove2: "removed" } });
			Module.reset();
			expect(Module._memory()).to.eql({});
		});
	});
});
