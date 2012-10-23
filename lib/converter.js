/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com>
 */

var fs = require('fs');
var path = require('path');
var mu = require('mu2');

var Converter = function(templatePath) {
	mu.root = templatePath;
};

module.exports = Converter;

Converter.prototype.convert = function(data, templateToUse, callback) {
	var items = [];

	console.log("Converting using template", templateToUse);

	var templatedData = '';
	var stream = mu.compileAndRender(templateToUse, data)
		.on('data', function(data) { templatedData += data.toString(); })
		.on('error', function(error) { callback(error); })
		.on('end', function() {
			callback(null, templatedData);
		});
}
