/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com>
 */	

module.exports.generateData = function(cards) {
 	var items = [];
 	console.log("Starting export of", cards.length, "cards having release notes ...");
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
			"link": settings.exportLinks ? item.url : null,
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

 function getReleaseNotesFrom(card) {
	var releaseNotes = [];

	for (var i = 0; i < card.actions.length; i++) {
		var action = card.actions[i];
		if (action.type === 'commentCard' && action.data.text.indexOf(settings.releaseIdentifier) === 0)
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
    return curr_year + "-" + curr_month + "-" + curr_date;
}