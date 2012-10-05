try {
    var reporter = require('nodeunit').reporters.default;
}
catch(e) {
    console.log("Cannot find nodeunit module.");
    console.log("Please install nodeunit.");
    process.exit();
}

reporter.run(['test']);