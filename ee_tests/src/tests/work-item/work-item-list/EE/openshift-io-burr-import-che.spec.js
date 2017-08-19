/**
 * POC test for automated UI tests for openshift.io
 *  
 * Note on screen resolutions - See: http://www.itunesextractor.com/iphone-ipad-resolution.html
 * Tests will be run on these resolutions:
 * - iPhone6s - 375x667
 * - iPad air - 768x1024
 * - Desktop -  1920x1080
 * 
 * beforeEach will set the mode to phone. Any tests requiring a different resolution will must set explicitly. 
 *  * 
 * @author ldimaggi, bsutter
 */

/* Actions to be performed by this EE Demo/Test - As suggested by Burr - June 2017
  https://vimeo.com/221033408
  Step 1) Login to openshift.io
  Step 2) In OSIO, create new space
  Step 3) In OSIO, add quickstart to space - Vert.X - accept all defaults
  Step 4) In OSIO, verify creation of pipeline and build. promote build to "run" project
  Step 5) In OSIO, create new workitem, type = bug, assign to current user, set status to “in progress”
  Step 6) In OSIO, create Che workspace for project 
  Step 7) In OSIO, open Che workspace for project
  Step 8) In Che editor, edit index.html to alter message displayed by Vert.X project
  Step 9) In Che terminal window, execute: mvn clean compile test
  Step 10) In Che, execute Junit test
  Step 11) In Che, run the Vert.X application
  Step 12) In Che terminal window, execute: curl localhost:8080/api/greeting?name=test
  Step 13) In Che, commit changes to git
  Step 14) In Che, execute git push
  Step 15) In github, verify code changes were saved
  Step 16) In OSIO, verify that github webhook fired and project pipeline is running
  Step 17) In OSIO, access Jenkins log
  Step 18) In Jenkins, verify that log shows the application has built and tests have run 
  Step 19) 1In Che, locate realtime analysis of bad dependency - ch.qos.logstack
  Step 20) In Che, verify that CVE is caught
  Step 21) In Jenkins, locate OSIO Analytics (Bayesian) in Jenkins log
  Step 22) In OSIO, verify that rollout to stage was successful
  Step 23) In OSIO, in “Applications” tab, verify project is successful on stage
  Step 24) In OpenShift console, verify project is running on stage
  Step 25) In OpenShift console, click on deployed application to access the app on stage
  Step 26) In OSIO, approve promotion to production
  Step 27) In OpenShift console, click on deployed application to access the app on production
  Step 28) In OSIO, under pipelines, select “Stack Reports”
  Step 29) In OSIO, verify contents of Stack Report Recommendations for unresolved CVE
  Step 30) In OSIO, log out
*/

var until = protractor.ExpectedConditions;

var OpenShiftIoStartPage = require('../page-objects/openshift-io-start.page'),
    OpenShiftIoRHDLoginPage = require('../page-objects/openshift-io-RHD-login.page'),
    OpenShiftIoGithubLoginPage = require('../page-objects/openshift-io-github-login.page'),
    OpenShiftIoDashboardPage = require('../page-objects/openshift-io-dashboard.page'),
    OpenShiftIoSpaceHomePage = require('../page-objects/openshift-io-spacehome.page'),
    OpenShiftIoRegistrationPage = require('../page-objects/openshift-io-registration.page'),
    OpenShiftIoPipelinePage = require('../page-objects/openshift-io-pipeline.page'),
    OpenShiftIoCodebasePage = require('../page-objects/openshift-io-codebase.page'),
    OpenShiftIoChePage = require('../page-objects/openshift-io-che.page'),
    testSupport = require('../testSupport'),
    constants = require("../constants");

/* TODO - convert this into a test parameter */
const GITHUB_NAME = "osiotestmachine";
const IMPORT_NAME = "vertxbasic";

describe('openshift.io End-to-End POC test - Scenario - IMPORT project - Run Che: ', function () {
  var page, items, browserMode;

  /* Set up for each function */
  beforeEach(function () {
    testSupport.setBrowserMode('desktop');
    // Failed: Error while waiting for Protractor to sync with the page: "window.getAllAngularTestabilities is not a function"
    // http://stackoverflow.com/questions/38050626/angular-2-with-protractorjs-failed-error-while-waiting-for-protractor-to-sync-w 
    browser.ignoreSynchronization = true;
    page = new OpenShiftIoStartPage(browser.params.target.url);  
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000000;   /* 10 minutes */

// Commented out pending creation of Jenkins secret for OSO token
    /* Clean the user account's OpenShift Online resources */
    var process = require('child_process').execSync;
    var result = process('sh ./local_cleanup.sh ' + browser.params.login.user + ' ' + browser.params.oso.token).toString();
    console.log(result);
  });

  /* Tests must reset the browser so that the test can logout/login cleanly */
  afterEach(function () { 
    browser.restart();
  });

  /* Simple test for registered user */
  it("should perform Burr's demo - IMPORT project - Run Che", function() {

//    var webdriver = require("selenium-webdriver");
//    var chrome = require("selenium-webdriver/chrome");
//    var options = new chrome.Options();
//    var path = require('chromedriver').path;
//    var service = new chrome.ServiceBuilder(path).build();
//    options.addArguments('disable-popup-blocking');
//    chrome.setDefaultService(service);
//    var driver = new webdriver.Builder()
//      .withCapabilities(webdriver.Capabilities.chrome())
//      .build();
   
    /* Protractor must recreate its ExpectedConditions if the browser is restarted */
    until = protractor.ExpectedConditions;
    
    console.log ("Test for target URL: " + browser.params.target.url)

    /* ----------------------------------------------------------*/
    /* Step 1) Login to openshift.io */

    OpenShiftIoRHDLoginPage = page.clickLoginButton();

    OpenShiftIoRHDLoginPage.clickRhdUsernameField();
    OpenShiftIoRHDLoginPage.typeRhdUsernameField(browser.params.login.user);
    OpenShiftIoRHDLoginPage.clickRhdPasswordField();
    OpenShiftIoRHDLoginPage.typeRhdPasswordField(browser.params.login.password);
    OpenShiftIoDashboardPage = OpenShiftIoRHDLoginPage.clickRhdLoginButton();

    /* The user's account is cleaned before the test runs. The test must now Update the user's tenant, and
       wait until Che and Jenkins pods are running before starting the test. */
    OpenShiftIoDashboardPage.clickrightNavigationBar();
    OpenShiftIoDashboardPage.clickProfile();
    OpenShiftIoDashboardPage.clickupdateProfileButton();
    OpenShiftIoDashboardPage.clickupdateTenantButton();
    OpenShiftIoDashboardPage.clickHeaderDropDownToggle();
    browser.sleep(constants.WAIT);
    OpenShiftIoDashboardPage.clickAccountHomeUnderLeftNavigationBar();

    /* Wait until the Jenkins status icon indicates that the Jenkins pod is running. */
    OpenShiftIoDashboardPage.clickStatusIcon();
    browser.wait(until.presenceOf(OpenShiftIoDashboardPage.cheStatusPoweredOn), constants.LONGEST_WAIT);
    browser.wait(until.presenceOf(OpenShiftIoDashboardPage.jenkinsStatusPoweredOn), constants.LONGEST_WAIT);
    browser.sleep(constants.LONG_WAIT);

    /* ----------------------------------------------------------*/
    /* Step 2) In OSIO, create new space */

    OpenShiftIoDashboardPage.clickHeaderDropDownToggle();
    browser.sleep(constants.WAIT);
    OpenShiftIoDashboardPage.clickCreateSpaceUnderLeftNavigationBar();  

    var spaceTime = returnTime();
    OpenShiftIoDashboardPage.typeNewSpaceName((spaceTime));
    OpenShiftIoDashboardPage.typeDevProcess("Scenario Driven Planning");
    OpenShiftIoDashboardPage.clickCreateSpaceButton();   

    /* For the purposes of this test - ignore all 'toast' popup warnings */
    OpenShiftIoDashboardPage.waitForToastToClose();
    OpenShiftIoSpaceHomePage = OpenShiftIoDashboardPage.clickNoThanksButton();

    /* In the space home page, verify URL and end the test */
    browser.wait(until.urlContains('https://openshift.io/' + browser.params.login.user + '/'+ spaceTime), constants.WAIT);
    browser.wait(until.urlIs('https://openshift.io/' + browser.params.login.user + '/'+ spaceTime), constants.WAIT); 
    expect(browser.getCurrentUrl()).toEqual('https://openshift.io/' + browser.params.login.user + '/'+ spaceTime);

    browser.getCurrentUrl().then(function (text) { 
       console.log ('EE POC test - new space URL = ' + text);
    });

    /* ----------------------------------------------------------*/
    /* Step 3) In OSIO, add quickstart to space - Vert.X - accept all defaults */

    OpenShiftIoDashboardPage.waitForToastToClose();
    OpenShiftIoSpaceHomePage.clickPrimaryAddToSpaceButton();  

    OpenShiftIoSpaceHomePage.clickImportCodebaseButton();
    OpenShiftIoSpaceHomePage.clickImportCodebaseByName (IMPORT_NAME);
    OpenShiftIoSpaceHomePage.clickQuickStartNextButton2();  // End of dialog page 2/3
    OpenShiftIoSpaceHomePage.clickQuickStartFinishButton2();
    OpenShiftIoSpaceHomePage.clickOkButton();

    /* Trap 'Application Generation Error' here - if found, fail test and exit */
    expect(OpenShiftIoDashboardPage.appGenerationError.isPresent()).toBe(false);
    OpenShiftIoDashboardPage.waitForToastToClose();

   /* ----------------------------------------------------------*/
   /*  Step 4) In OSIO, verify creation of pipeline and build. promote build to "run" project */

    /* ----------------------------------------------------------*/
    /* Step 5) In OSIO, create new workitem, type = bug, assign to current user, set status to “in progress” */
    /* TODO */

    /* Step 6) In OSIO, create Che workspace for project   */

    /* Start by creating a codebase for the newly created project */
    browser.sleep(constants.LONG_WAIT);
    OpenShiftIoDashboardPage.clickHeaderDropDownToggle();
    browser.sleep(constants.WAIT);
    OpenShiftIoDashboardPage.clickAccountHomeUnderLeftNavigationBar();
 
    /* Go to the Create page - https://openshift.io/almusertest1/testmay91494369460731/create  */
    browser.get("https://openshift.io/" + browser.params.login.user + "/" + spaceTime + "/create");
    OpenShiftIoCodebasePage = new OpenShiftIoCodebasePage();
    
    OpenShiftIoCodebasePage.codebaseList.getText().then(function(text){
      console.log("Codebases page contents = " + text);
    });

    browser.wait(until.elementToBeClickable(OpenShiftIoCodebasePage.codebaseByName (browser.params.login.user, IMPORT_NAME, GITHUB_NAME)), constants.WAIT, 'Failed to find CodebaseByName');
    OpenShiftIoCodebasePage.codebaseByName (browser.params.login.user, IMPORT_NAME, GITHUB_NAME).getText().then(function(text){
      console.log("Codebase = " + text);
    });

    OpenShiftIoCodebasePage.clickCreateCodebaseKebab();
    OpenShiftIoChePage = OpenShiftIoCodebasePage.clickCreateCodebaseIcon();

    
    /* Switch to Che browser tab */
    browser.sleep(constants.LONG_WAIT);
    browser.getAllWindowHandles().then(function (handles) {

        console.log("Number of browser tabs = " + handles.length);
        if (handles.length == 1) {
          console.log ("ERROR - Che browser window did not open");
        }

        expect(handles.length).toBe(2);

        browser.switchTo().window(handles[1]);
        browser.getCurrentUrl().then(function(url) {
            console.log("Che workspace URL = " + url);
        });
    });

//    /* Look for the project in the Che navigator */
//    OpenShiftIoChePage.projectRootByName(IMPORT_NAME).getText().then(function (text) { 
//       console.log ('EE POC test - projectName = ' + text);
//    });
//    expect(OpenShiftIoChePage.projectRootByName(IMPORT_NAME).getText()).toBe(IMPORT_NAME);

    /* Switch back to the OSIO page */
    browser.sleep(constants.WAIT);
    browser.getAllWindowHandles().then(function (handles) {
        browser.switchTo().window(handles[0]);
    });

    /* ----------------------------------------------------------*/
    /* Step 30) In OSIO, log out */

    /* For the purposes of this test - ignore all 'toast' popup warnings */
    OpenShiftIoDashboardPage.waitForToastToClose();

    OpenShiftIoDashboardPage.clickrightNavigationBar();
    OpenShiftIoDashboardPage.clickLogOut();
  });

});

  /* Get system time in seconds since 1970 */
  var returnTime = function () {

    var month = new Array();
    month[0] = "jan";
    month[1] = "feb";
    month[2] = "mar";
    month[3] = "apr";
    month[4] = "may";
    month[5] = "jun";
    month[6] = "jul";
    month[7] = "aug";
    month[8] = "sep";
    month[9] = "oct";
    month[10] = "nov";
    month[11] = "dec";

    var d = new Date();
    var m = month[d.getMonth()];
    var day = d.getDate(); 
    var n = d.getTime();
 
    console.log ("EE POC test - Creating space: " + m + day.toString() + n.toString());
    return "test" +  m + day.toString() + n.toString();
  }