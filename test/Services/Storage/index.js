"use strict";

var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
chai.should();
chai.use(require("chai-sinon"));

const Storage = require("../../../src/Services/Storage");

describe("Storage Module", function() {
	context("Exported functions", function() {
		it("should export Appointments", function() {
			expect(Storage.Appointments).to.be.an("Object");
		});
		it("should export Facilities", function() {
			expect(Storage.Facilities).to.be.a("Object");
		});
		it("should export Patients", function() {
			expect(Storage.Patients).to.be.a("Object");
		});
		it("should export Providers", function() {
			expect(Storage.Patients).to.be.a("Object");
		});
	});
});
