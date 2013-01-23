/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com>
 */

var options = require('optimist')
			  .usage('Generate release notes from Trello cards.\n\nUsage: $0')
			  .alias('g', 'generate')
			  .describe('g', 'Generate from list names')
			  .string('g')
			  .alias('b', 'boardid')
			  .describe('b', 'The board id from Trello')
			  .string('b')
			  .alias('l', 'list')
			  .describe('l', 'Show lists of given board. Default: all. Possible: open, closed, all')
			  .string('l')
			  .alias('v', 'version')
			  .describe('v', 'Product version')
			  .string('v');
var optionArgs = options.argv;

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
			fs.mkdirSync(settings.root, 0666);
		}
	}
});


var lists = optionArgs.g;
var boardId = optionArgs.b;
var showLists = optionArgs.l;
var version = optionArgs.v;

if (version){
	if (version.length) {
		console.log("Taking other version than configured ...");
		settings.strings.version_number = version;
	} else {
		console.log("Option for version defined, but no version given. Taking from settings.");
	}
}

if (boardId) {
	if (boardId.length) {
		console.log("Taking other board id than configured ...");
		settings.boardId = boardId;
	} else {
		console.log("Option for board id defined, but no id given. Taking from settings.");
	}
}

if (showLists) {
	if (showLists.length) {
		getLists(showLists);
	} else {
		getLists('all');
	}
} else if (lists && lists.length) {
	start();
} else if (lists && !lists.length) {
	console.log('Option -g has no defined list names');
	console.log('');
	example();
} else {
	options.showHelp();
}

function example() {
	console.log('Example:');
	console.log('    index.js -g MyList');
	console.log('    index.js -g "Version 2.9, Version 3.0"');
	console.log('    index.js -g "Version 2.9, Version 3.0" -b "theboardid"');
}

function getLists(filter) {
	var receiver = new TrelloReceiver(settings.applicationKey, settings.userToken, settings.boardId);
	receiver.getLists(filter, function(error,data) {
		if (error) {
			console.log(error instanceof Error ? error.message : error);
		} else {
			if (data) {
				for (var i = 0; i < data.length; i++) {
					console.log((data[i].closed ? '[closed] ' : '[open]   ') + data[i].id + ' ' + data[i].name);
				}
			}
			
		}
	});
}

function start() {
	var receiver = new TrelloReceiver(settings.applicationKey, settings.userToken, settings.boardId);
	receiver.receive(lists.split(','), function(err, cards) {
		if (err) {
			console.log(err instanceof Error ? err.message : err);
			return;
		}

		if (cards.length > 0) {
			var converter = new Converter(path.join(__dirname, "templates"));
			var data = Generator.generateData(cards);
			converter.convert(data, settings.template, function(convertError, data) {
				if (convertError) {
					console.log(convertError instanceof Error ? convertError.message : convertError);
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
	var filename = path.join(settings.root, settings.strings.product.replace(' ', '_') + "_" + settings.strings.version_number.replace(/\./gi,'_') + '.markdown');

	fs.writeFile(filename, content, function(err) {
		if (err) throw err;
		console.log("Release notes exported successfully");
	});
}