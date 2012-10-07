/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var fs = require('fs');
var path = require('path');
var mu = require('mu2');

var Exporter = function(templatePath, templateToUse) {
	mu.root = templatePath;
	this.templateToUse = templateToUse;
};

module.exports = Exporter;

Exporter.prototype.exportCards = function(cards, file) {
	var items = [];

	console.log("Starting export of", cards.length, "cards having release notes ...");

	var cardsData = getData(cards);
	var templatedData = '';
	var stream = mu.compileAndRender(this.templateToUse, cardsData)
		.on('data', function(data) { templatedData += data.toString(); })
		.on('error', function(error) { throw new Error(error); })
		.on('end', function() {
			save(templatedData);
		});
}

function getData(cards) {
	var data = {
		"header": settings.strings.header,
		"product": settings.strings.product,
		"version": settings.strings.version,
		"version_number": settings.strings.version_number,
		"generated": settings.strings.generated,
		"date": getCurrentDate(),
		"subheader": settings.strings.subheader,
		"data": []
	};

	cards.forEach(function(item) {
		var card = {
			"name": item.name,
			"labels": getLabels(item),
			"link": item.url,
			"releasenotes": []
		};

		var releaseNotes = getReleaseNotesFrom(item);
		if (releaseNotes.length > 0) {
			releaseNotes.forEach(function(rn) {
				card.releasenotes.push( { "singleNote": rn });
			});
			data.data.push(card);
		}
	});

	return data;
}

function save(content) {
	var filename = path.join(settings.root, 'export', settings.strings.product.replace(' ', '_') + "_" + settings.strings.version_number.replace('.','_') + '.markdown');
	var directory = path.dirname(filename);

	var exists = fs.existsSync(directory);
	if (!exists) {
		fs.mkdirSync(directory, 0666);
	}

	fs.writeFile(filename, content, function(err) {
		if (err) throw err;
		console.log("Release notes exported successfully");
	});
}

function getReleaseNotesFrom(card) {
	var releaseNotes = [];

	for (var i = 0; i < card.actions.length; i++) {
		var action = card.actions[i];
		if (action.type = 'commentCard' && action.data.text.indexOf(settings.releaseIdentifier) === 0)
			releaseNotes.push(action.data.text.replace(settings.releaseIdentifier,'').replace(/^\s+|\s+$/g, ''));
	}

	return releaseNotes;
}

function getLabels(card) {
	var labels = [];

	for (var i = 0; i < card.labels.length; i++) {

		labels.push({ "name" : card.labels[i].name || card.labels[i].color });
	}
	return labels;
}

function getCurrentDate() {
	var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();
    return curr_date + "-" + curr_month + "-" + curr_year;
}
