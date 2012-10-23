/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com>
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

var TrelloReceiver = require('./lib/cardreceiver');
var Converter = require('./lib/converter');
var Generator = require('./lib/datagenerator');

// read settings
global.settings = require('./settings');
fs.exists(settings.exportPath, function(exists) {
	if (exists) {
		settings.root = settings.exportPath;
	}
	else {
		settings.root = path.join(__dirname.replace(/\/+$/, ""), "export");

		var exists = fs.existsSync(settings.root);
		if (!exists) {
			fs.mkdirSync(directory, 0666);
		}
	}
});


var lists = options.g;
var boardId = options.b;

if (boardId) {
	if (boardId.length) {
		console.log("Taking other board id than configured ...");
		settings.boardId = boardId;
	} else {
		console.log("Option for board id defined, but no id given. Taking from settings.");
	}
}

if (lists.length) {
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
			var converter = new Converter(path.join(__dirname, "templates"));
			var data = Generator.generateData(cards);
			converter.convert(data, settings.template, function(error, data) {
				if (error) {
					console.log(error);
				}
				else {
					save(data);
				}
			});
		} else {
			console.log("No cards having release notes found.");
		}
	});
}

function save(content) {
	var filename = path.join(settings.root, settings.strings.product.replace(' ', '_') + "_" + settings.strings.version_number.replace('.','_') + '.markdown');

	fs.writeFile(filename, content, function(err) {
		if (err) throw err;
		console.log("Release notes exported successfully");
	});
}