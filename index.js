/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var options = require('optimist').argv;
var path = require('path');
var fs = require('fs');

var TrelloReceiver = require('./lib/cardreceiver.js');
var TrelloExporter = require('./lib/cardexporter.js');

// read settings
global.settings = require('./settings');
settings.root   = __dirname.replace(/\/+$/, "");

if (options.g || options.generate) {

	var lists = options.g;
	var boardId = options.b;

	if (boardId && boardId.length !== undefined && boardId !== settings.boardId) {
		console.log("Taking other board id than configured ...");
		settings.boardId = boardId;
	} else if (boardId) {
		console.log("Option for board id defined, but no id given. Taking from settings.");
	}

	if (lists.length !== undefined) {
		var receiver = new TrelloReceiver(settings.applicationKey, settings.userToken);
		receiver.receive(lists.split(','), function(err, cards) {
			if (err) {
				console.log(err);
				return;
			}

			if (cards.length > 0) {
				TrelloExporter.exportCards(cards, settings.filename);
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