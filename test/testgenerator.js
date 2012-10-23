var nodeUnit = require('nodeunit');

module.exports = nodeUnit.testCase({

	setUp: function(callback) {
		generator = require('../lib/datagenerator');
		carddata = [];
		carddata.push(require('./carddata'));
		global.settings = require('../settings');
		callback();
	},

	tearDown: function(callback) {
		callback();
	},

	'testDataGenerator': function(test) {
		var generatedData = generator.generateData(carddata);
		test.ok(generatedData !== undefined, "Generated data is undefined");
		// further tests necessary
		test.done();
	}
});