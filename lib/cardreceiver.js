/*
 * Trello release notes generator
 *
 * Author: Norbert Eder <wpfnerd+nodejs@gmail.com>
 */

var required_trello = require('trello');
var rest = require('restler');
var errors = require('./errors');

String.prototype.trim = function() { return this.replace(/^\s\s*/, '').replace(/\s\s*$/,'');};

var CardReceiver = function(applicationKey, userToken, boardId) {
	if (!applicationKey) {
		throw new Error(errors.MISSING_APP_KEY);
	}
	if (!userToken) {
		throw new Error(errors.MISSING_USER_TOKEN);
	}
	if (!boardId) {
		throw new Error(errors.MISSING_BOARD_ID);
	}
	this.trello = new required_trello(applicationKey, userToken);
	this.boardId = boardId;
}

/*
 * Generates Markdown output with data from trello for the given lists
 */
CardReceiver.prototype.receive = function(lists, callback) {
	var me = this;

	me.getLists(function(err, foundLists) {

		if (foundLists.indexOf("invalid id") > -1 || foundLists.indexOf("invalid key") > -1) {
			console.log("No lists found. This might be due to an invalid board id or access token.");
			return;
		}
		if (err) {
			console.log(err);
			return;
		}

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
						callback(error);
					} else {
						for (var i = 0; i < cards.length; i++) {
							if (hasCardReleaseNodes(cards[i])) {
								releaseNotesCards.push(cards[i]);
							}
						}

						index++;

						if (index === listsToHandle.length) {
							callback(null, releaseNotesCards);
						}
					}
				});

			});
		}
	}); 
}

CardReceiver.prototype.getLists = function(callback) {
	makeRequest(rest.get, this.trello.uri + '/1/boards/' + this.boardId + '/lists', { query: this.trello.createQuery() }, callback);
}

CardReceiver.prototype.getListCards = function(listId, callback) {
	var cardQuery = this.trello.createQuery();
	cardQuery.actions = 'commentCard';
	makeRequest(rest.get, this.trello.uri + '/1/lists/' + listId + '/cards', { query: cardQuery }, callback);
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

function findListId(lists, listName) {
	for (var i = 0; i < lists.length; i++) {
		if (lists[i].name.toLowerCase().trim() === listName.toLowerCase().trim()) {
			return lists[i].id;
		}
		else {
			throw new Error(errors.NO_SUCH_LIST);
		}
	}
}

module.exports = CardReceiver;