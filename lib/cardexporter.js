/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var fs = require('fs');
var os = require('os');
var path = require('path');

var doubleLine = os.EOL + ' ' + os.EOL;

exports.exportCards = function(cards, file) {
	var items = [];

	console.log("Starting export of", cards.length, "cards having release notes ...");

	cards.forEach(function(card) {
		var releaseNotes = getReleaseNotesFrom(card);
		var templatedReleaseNotes = [];

		releaseNotes.forEach(function(note) {
			templatedReleaseNotes.push(getReleaseNotesTemplate().replace("{{singleNote}}", note));
		})

		var item = getCardTemplate().replace("{{name}}", card.name).replace("{{labels}}", getLabelsFlat(card) || "-").replace("{{releaseNotes}}", templatedReleaseNotes.join(doubleLine));
		items.push(item);
	});

	var content = getTemplate().replace("{{content}}", items.join(os.EOL));
	
	save(content);
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

function getLabelsFlat(card) {
	var labelNames = [];
	for (var i = 0; i < card.labels.length; i++) {
		labelNames.push(card.labels[i].name || card.labels[i].color);
	}
	if (labelNames.length > 0)
		return labelNames.join(', ');
	return null;
}

function getTemplate() {
	var template = [
		'# ', settings.strings.header, settings.strings.product,
		os.EOL,
		settings.strings.version, ' ', settings.strings.version_number,
		os.EOL,
		settings.strings.generated, ' ' + getCurrentDate(),
		doubleLine,
		'## ', settings.strings.subheader,
		doubleLine,
		'{{content}}'
	].join("");
	return template;
}

function getCurrentDate() {
	var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();
    return curr_date + "-" + curr_month + "-" + curr_year;
}

function getCardTemplate() {
	var template = [
		'**{{name}}**',
		os.EOL,
		'{{labels}}',
		doubleLine,
		'{{releaseNotes}}',
		doubleLine
	].join("");
	return template;
}

function getReleaseNotesTemplate() {
	var template = [
		'> {{singleNote}}'
	].join("");
	return template;
}