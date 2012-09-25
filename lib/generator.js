var required_trello = require('trello');
var rest = require('restler');

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
	console.log(query);
	return query;
}

function findListId(lists, listName) {

	for (var list in lists) {
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

	this.getLists(function(lists) {

		console.log(lists);
		var listId = findListId(lists, listName);
		console.log("Found listId: " + listId);
		if (listId) {
			getListCards(listId, function(error, cards) {
				if (error) {
					console.log(error);
				} else {
					for (var card in cards) {
						console.log("found card: " + card);
					}
				}
			});
		}

	}); 

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

	makeRequest(rest.get, apiUri + '/1/lists/' + listId + '/cards', { query: createQuery() }, callback);

}