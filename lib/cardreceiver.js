/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com
 */

var required_trello = require('trello');
var rest = require('restler');
var cardexporter = require('./cardexporter.js');

var appKey = "";
var token = "";
var apiUri = "https://api.trello.com";

var trello = {};

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

function findListId(lists, listName) {

	for (var i = 0; i < lists.length; i++) {
		var list = lists[i];
		if (list.name === listName)
			return list.id;
	}
	return null;
}

exports.init = function(applicationKey, userToken) {

	this.trello = new required_trello(applicationKey, userToken);
	appKey = applicationKey;
	token = userToken;
}

exports.generate = function(listName) {

	var me = this;
	me.getLists(function(err, lists) {

		if (err) {
			console.log(err);
			return;
		}

		var listId = findListId(lists, listName);
		console.log("Found list " + listName + " with id " + listId);
		if (listId) {
			me.getListCards(listId, function(error, cards) {
				if (error) {
					console.log(error);
				} else {
					var releaseNotesCards = [];
					for (var i = 0; i < cards.length; i++) {
						if (hasCardReleaseNodes(cards[i])) {
							releaseNotesCards.push(cards[i]);
						}
					}
					if (releaseNotesCards.length > 0) {
						cardexporter.exportCards(releaseNotesCards, settings.filename);
					} else {
						console.log("No cards having release notes found");
					}
				}
			});
		}

	}); 

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

	makeRequest(rest.get, apiUri + '/1/boards/' + settings.boardId + '/lists', { query: createQuery() }, callback);
}



exports.getListCards = function(listId, callback) {

	var cardQuery = createQuery();
	cardQuery.actions = 'commentCard';
	makeRequest(rest.get, apiUri + '/1/lists/' + listId + '/cards', { query: cardQuery }, callback);

}