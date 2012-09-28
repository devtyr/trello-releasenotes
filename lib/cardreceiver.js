/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var required_trello = require('trello');
var rest = require('restler');
var cardexporter = require('./cardexporter.js');
var async = require('async');

var appKey = "";
var token = "";
var apiUri = "https://api.trello.com";

var trello = {};

String.prototype.trim = function() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/,'');};

function makeRequest(fn, uri, options, callback) {
    fn(uri, options)
        .on('complete', function (result) {
            if (result instanceof Error) {
                callback(result);
            } else {
                callback(null, result);
            }
        });
}

function createQuery() {
	var query = { key: appKey, token: token };
	return query;
}

function getQueryFlat() {
	var queryFlat = createQuery();
	return "?key=" + queryFlat.key + "&token=" + queryFlat.token;
}

function findListId(lists, listName) {
	for (var i = 0; i < lists.length; i++) {
		if (lists[i].name.toLowerCase().trim() === listName.toLowerCase().trim())
			return lists[i].id;
	}
}

exports.init = function(applicationKey, userToken) {
	this.trello = new required_trello(applicationKey, userToken);
	appKey = applicationKey;
	token = userToken;
}

/*
 * Generates Markdown output with data from trello for the given lists
 */
exports.generate = function(lists) {
	var me = this;

	me.getLists(function(foundLists) {
		var releaseNotesCards = [];
		var listsToHandle = [];

		lists.forEach(function (list) {
			listId = findListId(foundLists, list);
			if (listId)
				listsToHandle.push(listId);
		});

		if (listsToHandle.length > 0) {
			var index = 0;
			listsToHandle.forEach(function(list) {
				me.getListCards(list, function(error, cards) {
					if (error) {
						console.log(error);
					} else {
						for (var i = 0; i < cards.length; i++) {
							if (hasCardReleaseNodes(cards[i])) {
								releaseNotesCards.push(cards[i]);
							}
						}

						index++;

						if (index === listsToHandle.length) {
							exportNotes(releaseNotesCards);
						}
					}
				});

			});
		}
	}); 
}

function exportNotes(releaseNotesToExport) {
	if (releaseNotesToExport.length > 0) {
		cardexporter.exportCards(releaseNotesToExport, settings.filename);
	} else {
		console.log("No cards having release notes found.");
	}
}

function hasCardReleaseNodes(card) {
	if (card.badges.comments > 0 && card.actions.length > 0) {
		for (var i = 0; i < card.actions.length; i++) {
			var action = card.actions[i];
			if (action.type === 'commentCard' && action.data.text.indexOf('RELEASE:') === 0)
				return true;
		}
	}
	return false;
}

exports.getLists = function(callback) {
	makeRequest(rest.get, apiUri + '/1/boards/' + settings.boardId + '/lists', { query: createQuery() }, function(error, lists) {

		if (error) {
			console.log(error);
		} else {
			callback(lists);
		}

	});
}

exports.getListCards = function(listId, callback) {
	var cardQuery = createQuery();
	cardQuery.actions = 'commentCard';
	makeRequest(rest.get, apiUri + '/1/lists/' + listId + '/cards', { query: cardQuery }, callback);

}