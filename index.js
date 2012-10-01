/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var options = require('optimist').argv;
var path = require('path');
var fs = require('fs');

var trello_generator = require('./lib/cardreceiver.js');
var trello_exporter = require('./lib/cardexporter.js');

// read settings
global.settings = require('./settings');
settings.root   = __dirname.replace(/\/+$/, "");

if (options.g || options.generate) {

	var lists = options.g;
	if (lists.length !== undefined) {
		var generator = new trello_generator(settings.applicationKey, settings.userToken);
		generator.receive(lists.split(','), function(err, cards) {
			if (err) {
				console.log(err);
				return;
			}

			if (cards.length > 0) {
				trello_exporter.exportCards(cards, settings.filename);
			} else {
				console.log("No cards having release notes found.");
			}
		});
	} else {
		console.log('Option -g has no defined list names');
		console.log('');
		example();
	}

} else {
	usage();
	console.log('');
	example();
}

function example() {
	console.log('Example:');
	console.log('    index.js -g MyList');
	console.log('    index.js -g "Version 2.9, Version 3.0"');
}

function usage() {
	console.log("Trello release notes generator (trello-releasenotes)");
	console.log("");
	console.log("Usage:");
	console.log("    index.js -g lists");
}