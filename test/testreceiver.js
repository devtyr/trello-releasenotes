var nodeUnit = require('nodeunit');

module.exports = nodeUnit.testCase({

	setUp: function(callback) {
		receiver = require('../lib/cardreceiver');
		errors = require('../lib/errors');
		callback();
	},

	tearDown: function(callback) {
		callback();
	},

	'testReceiverImported': function(test) {
		test.ok(receiver !== undefined, "Receiver is undefined");
		test.done();
	},

	'testInitWithoutApplicationKey': function(test) {
		test.throws(
			function() {
				var rcv = new receiver();
			},
			function(err) {
				for (attr in err) {
					console.log(attr);
				}
				if (err instanceof Error && err.message === errors.MISSING_APP_KEY) {
					return true;
				}
		    }
		);
		test.done();
	},

	'testInitWithoutUserToken': function(test) {
		test.throws(
			function() {
				var rcv = new receiver("testAppKey");
			},
			function(err) {
				if (err instanceof Error && err.message === errors.MISSING_USER_TOKEN) {
					return true;
				}
		    }
		);
		test.done();	
	},

	'testInitWithoutBoardId': function(test) {
		test.throws(
			function() {
				var rcv = new receiver("testAppKey", "testUserToken");
			},
			function(err) {
				if (err instanceof Error && err.message === errors.MISSING_BOARD_ID) {
					return true;
				}
		    }
		);
		test.done();	
	}

});