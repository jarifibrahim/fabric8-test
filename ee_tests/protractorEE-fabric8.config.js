var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var reporter = new HtmlScreenshotReporter({
  dest: 'target/screenshots',
  filename: 'my-report.html',
  reportOnlyFailedSpecs: false,
  captureOnlyFailedSpecs: false,
  inlineImages: true
});

exports.config = {
    useAllAngular2AppRoots: true,
    getPageTimeout: 30000,
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['src/tests/**/EE/*.js'],
    exclude: ['src/tests/**/EXCLUDE/*.js'],

    suites: {
      runTest: ['src/tests/**/EE/*burr-quickstart.spec.js'],
      runOneTest: ['src/tests/**/EE/*burr-quickstart.spec.js'],
      setupTest:  'src/tests/**/EE/*setup*.spec.js'
    },

    jasmineNodeOpts: {
        defaultTimeoutInterval: 60000
    },
    capabilities: {
      'browserName': 'chrome',
      'chromeOptions': {
        'args': [ '--no-sandbox', 'disable-popup-blocking=true' ]
      }
    },

  // Setup the report before any tests start
  beforeLaunch: function() {
    return new Promise(function(resolve){
      reporter.beforeLaunch(resolve);
    });
  },

  // Assign the test reporter to each running instance
  onPrepare: function() {
    jasmine.getEnv().addReporter(reporter);
  },

  // Close the report after all tests finish
  afterLaunch: function(exitCode) {
    return new Promise(function(resolve){
      reporter.afterLaunch(resolve.bind(this, exitCode));
    });
  }

};
