# trello-releasenotes

A trello release notes generator for node.js

## Installation

You can install it using `npm`.

	npm install trello-releasenotes

### Obtain a Trello token

First, log in to Trello and open [Generate API Keys](https://trello.com/1/appKey/generate "Generate API Keys"). You'll receive an key to use in the next step.

Second, call https://trello.com/1/authorize?key=YOUR_KEY&name=trello-releasenotes&expiration=never&response_type=token to grant access for this application.

> For further information visit: [Getting a Token from a User](https://trello.com/docs/gettingstarted/index.html#getting-a-token-from-a-user "Getting a Token from a User")

Store the key and the given token in `settings.json`.


## Usage

There are some settings you can set up in `settings.json`:

	applicationKey		Insert your obtained application key from Trello to get access to it
	userToken			Define your user token you'll receive when obtaining an application ey
	boardId				Define the id of the board you want to search for release notes
	strings				These are used to create the export, translate them into your language if you want

> `version` and `product` of `strings` are used to generate the filename. 

### How to obtain the board id

When you open your Trello account you get a list of boards, open one of it and the URL will be something like

	https://trello.com/board/boardname/identifier

Copy `identifier` and set this one as the `boardId` in `settings.json`.

### Export

To export release notes start it like shown bellow:

	node index.js -g [LISTNAME]

Replace `[LISTNAME]` with the name of your list that contains the cards and release note for export.

### Example

To export all release notes of list 'Done' execute

	node index.js -g Done

It is also possible to export release notes of several lists. Call it like this:

	node index.js -g "My List 1, My List 2"

This will search `My List 1` and `My List 2` for cards having release notes.

Please note that the result is a `.markdown` file that can be processed with other modules like [ideamark](https://github.com/devtyr/ideamark "ideamark") or [mdserv](https://github.com/Bonuspunkt/mdserv "mdserv").

### Which cards will be exported?

All cards of the given list having comments that start with `RELEASE:` are exported. If there are multiple entries having this "flag", all of them are exported.

## License

MIT

## Upcoming Features

* Generation of HTML and PDF output
* Real templating

