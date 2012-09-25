/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var options = require('optimist').argv;
var path = require('path');
var fs = require('fs');

var trello_generator = require('./lib/generator.js');

// read settings
global.settings = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf-8'));

if (options.g || options.generate) {

	var listName = options.g;
	if (listName) {
		trello_generator.init(settings.applicationKey, settings.userToken);
		trello_generator.generate(listName);
	} else {
		console.log("no [listId] given");
	}

} else {
	console.log("trello-releasenotes");
	console.log("Usage:");
	console.log("index.js -g listName");
}