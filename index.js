/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var options = require('optimist')
			  .usage('Generate release notes from Trello cards.\n\nUsage: $0')
			  .demand('g')
			  .alias('g', 'generate')
			  .describe('g', 'Generate from list names')
			  .string('g')
			  .alias('b', 'boardid')
			  .describe('b', 'The board id from Trello')
			  .string('b')
			  .argv;
var path = require('path');
var fs = require('fs');

var TrelloReceiver = require('./lib/cardreceiver.js');
var TrelloExporter = require('./lib/cardexporter.js');

// read settings
global.settings = require('./settings');
settings.root   = __dirname.replace(/\/+$/, "");

var lists = options.g;
var boardId = options.b;

if (boardId) {
	if (boardId.length !== undefined) {
		console.log("Taking other board id than configured ...");
		settings.boardId = boardId;
	} else {
		console.log("Option for board id defined, but no id given. Taking from settings.");
	}
}

if (lists.length !== undefined) {
	start();
} else {
	console.log('Option -g has no defined list names');
	console.log('');
	example();
}

function example() {
	console.log('Example:');
	console.log('    index.js -g MyList');
	console.log('    index.js -g "Version 2.9, Version 3.0"');
	console.log('    index.js -g "Version 2.9, Version 3.0" -b "theboardid"');
}

function start() {
	var receiver = new TrelloReceiver(settings.applicationKey, settings.userToken, settings.boardId);
	receiver.receive(lists.split(','), function(err, cards) {
		if (err) {
			console.log(err);
			return;
		}

		if (cards.length > 0) {
			var exporter = new TrelloExporter(path.join(__dirname, "templates"), settings.template);
			exporter.exportCards(cards, settings.filename);
		} else {
			console.log("No cards having release notes found.");
		}
	});
}
