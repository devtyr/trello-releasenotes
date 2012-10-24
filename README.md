# trello-releasenotes

A trello release notes generator for node.js

## Installation

You can install it using `npm`.

	npm install trello-releasenotes

### Obtain a Trello token

First, log in to Trello and open [Generate API Keys](https://trello.com/1/appKey/generate "Generate API Keys"). You'll receive an key to use in the next step.

Second, call https://trello.com/1/authorize?key=YOUR_KEY&name=trello-releasenotes&expiration=never&response_type=token to grant access for this application. Be sure to replace `YOUR_KEY` with the key received in the first step.

> For further information visit: [Getting a Token from a User](https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user "Getting a Token from a User")

Store the key from the first action in setting `applicationKey` of `settings.json` and the token received from the second step in `userToken`.


## Usage

There are some settings you can set up in `settings.json`:

	applicationKey		Insert your obtained application key from Trello to get access to it
	userToken			Define your user token you'll receive when obtaining an application ey
	boardId				Define the id of the board you want to search for release notes
	releaseIdentifier   Default is set to 'RELEASE:'
	template			Defines the template to use
	exportLink			if true, links are written to the exported data; the default template is able to handle that
	strings				These are used to create the export, translate them into your language if you want

> `version` and `product` of `strings` are used to generate the filename. 

### How to obtain the board id

When you open your Trello account you get a list of boards, open one of it and the URL will be something like

	https://trello.com/board/boardname/identifier

Copy `identifier` and set this one as the `boardId` in `settings.json`. This is used to search for lists if there is no command line option that overrides that setting.

### Export

To export release notes start it like shown bellow:

	node index.js -g [LISTNAME(S)]

Replace `[LISTNAME(S)]` with the name of your list that contains the cards and release note for export. In this case the configured `boardId` from `settings.json` will be used to find the internal id of `[LISTNAME(S)]`. In case you have different boards, you can override the configured `boardId` by using the `-b` option.

	node index.js -g [LISTNAME(S)] -b [BOARDID]


### Example

To export all release notes of list 'Done' execute

	node index.js -g Done

It is also possible to export release notes of several lists. Call it like this:

	node index.js -g "My List 1, My List 2"

This will search `My List 1` and `My List 2` for cards having release notes.


Please note that the result is a `.markdown` file that can be processed with other modules like [ideamark](https://github.com/devtyr/ideamark "ideamark") or [mdserv](https://github.com/Bonuspunkt/mdserv "mdserv"). In this combination you can directly serve your exported release notes via HTTP.

### Which cards will be exported?

All cards of the given list having comments that start with `RELEASE:` (default) are exported. If there are multiple entries having this "flag", all of them are exported. You are able to change this setting in `settings.json`, change `releaseIdentifier` to a value you like to use.

> Please note that all lists (also archived ones) are considered.

### Show available lists

In some cases it is very helpful to view the lists available within the configured board. To get an overview use the option `-l` or `--list`:

	node index.js -l

This will come up with a complete list, showing the status (open, closed), list id and the name. It's also possible to get a list of a specific status. This options are available:

	node index.js -l all       The same as -l without a parameter
	node index.js -l open      Shows all lists that are not archived.
	node index.js -l closed    Shows all archieved lists

## Usage from other modules

It is also possible to use this module from another one. For example to receive all cards having release notes for the specified lists:

	var TrelloReceiver = require('./lib/cardreceiver.js');

	var lists = ["list1", "list2"];
	var receiver = new TrelloReceiver("applicationKey", "userToken", "boardId");

	receiver.receive(lists, function(err, cards) {
		if (err) {
			// handle error
		}

		// do something with your cards here
	});

It's also possible to work with lists:

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

The filter defines (if set) which lists to be received. Possible values based on the Trello API:

- none
- open
- closed
- all

## Templating

**trello-releasenotes** uses [Mu - a fast, streaming Node.js Mustache engine](https://github.com/raycmorgan/Mu) as the templating engine. Have a look at the [documentation](http://mustache.github.com/mustache.5.html) to get familiar with Mustache. A simple template (it's the default of trello-releasenotes):

	# {{header}} {{product}}
	{{version}} **{{version_number}}**

	{{generated}} **{{date}}**


	## {{subheader}}

	{{#data}}
	**{{name}}**
	{{#labels}}  `{{name}}` {{/labels}}

	{{#releasenotes}}
	> {{singleNote}}
	 

	{{/releasenotes}}
	{{/data}}
	{{^data}}
	No release notes available!
	{{/data}}

As you are able to configure the used templates within `settings.json` you can add new templates easily. Otherwise feel free to change the existing ones.

This is the available structure for templating:

	{
		"header": "",
		"product": "",
		"version": "",
		"version_number": "",
		"generated": "",
		"date": "",
		"subheader": "",
		"data": 
			[
				{
					"name": "",
					"labels": "",
					"link": "",
					"releasenotes": 
						[
							{ "singleNote": "" }
						]
				}
			]
	}

`data` is an array of all found cards. `releasenotes` is an array of all release notes found for the card.

## Upcoming Features

* Generation of HTML and PDF output
* Option to receive all lists for configured/specified board id

If there are bugs or ideas for this project please leave a ticket [here](https://github.com/devtyr/trello-releasenotes/issues).

## Continuous Integration status

This project is tested with [Travis CI](http://travis-ci.org/).

[![Build Status](https://secure.travis-ci.org/devtyr/trello-releasenotes.png)](http://travis-ci.org/devtyr/trello-releasenotes)

## License

trello-releasenotes is licensed under MIT.


[![endorse](http://api.coderwall.com/devtyr/endorsecount.png)](http://coderwall.com/devtyr)