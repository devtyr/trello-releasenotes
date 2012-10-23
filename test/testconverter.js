var nodeUnit = require('nodeunit');
var Converter = require('../lib/converter');
var path = require('path');

module.exports = nodeUnit.testCase({

	setUp: function(callback) {
		var myPath = path.dirname(__dirname);
		converter = new Converter(path.join(myPath, "templates"));
		carddata = require('./carddata');
		callback();
	},

	tearDown: function(callback) {
		callback();
	},

	'testMarkdownConverter': function(test) {
		converter.convert(carddata, "default.template", function(error, data) {
			test.ok(data !== undefined, "Converted data is undefined");
			// Comparison to generated output necessary
		});
		test.done();
	}
});