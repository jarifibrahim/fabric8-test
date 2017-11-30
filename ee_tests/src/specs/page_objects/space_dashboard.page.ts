import { Planner } from './planner/mainPage';
import { BaseElement, Clickable } from './../ui/base.element';
/*
  OSIO EE test - Page object model - The page hierarchy is:
  * landing.page.ts - User starts here - User selects "Log In" and is moved to the login page
  * login.page.ts - At this page the user selects the log in path, enters name/password
  * main_dashboard.page.ts - Account dashboard page - This is the user's top level page insisde of OSIO
  * space_dashboard.page.ts - Space dashboard page - From here the user is able to perform tasks inside the space
*/

import { browser, element, by, By, ExpectedConditions as until, $, $$, ElementFinder } from 'protractor';
import { BasePage } from './base.page';
import * as ui from '../ui';
import { AddToSpaceDialog } from './space_dashboard/add_to_space_dialog';
import { TextInput, Button } from '../ui';
import { WorkItemList } from './planner/workitem-list';

/*
Page layout
|--------------------------------------------------------------------------------------------------------------------|
|                                          Top Navigation Bar                                                        |
| Left Navigation Bar            |                                                  | Right Navigation Bar           |
|                                |                                                  |                                |
|                                                                                                                    |
| Persistent navigation bar                                                                                          |
|--------------------------------------------------------------------------------------------------------------------|
|                                       |                                                                            |
|                                       |                                                                            |
|          Codebases                    |                       Stack Reporrs                                        |
|                                       |                                                                            |
|                                       |                                                                            |
|--------------------------------------------------------------------------------------------------------------------|
|                                       |                                    |                                       |
|                                       |                                    |                                       |
|          My Work Items                |             Pipelines              |        Environments                   |
|                                       |                                    |                                       |
|                                       |                                    |                                       |
|--------------------------------------------------------------------------------------------------------------------|
*/


class SpaceDashboardPageHeader extends BaseElement {
  analyseTab = new ui.Clickable(this.element(by.cssContainingText('li', 'Analyse')), 'Analyse');
  planTab = new ui.Clickable(this.element(by.cssContainingText('li', 'Plan')), 'Plan');
  createTab = new ui.Clickable(this.element(by.cssContainingText('li', 'Create')), 'Analyse');

  constructor(el: ElementFinder) {
    super(el);
  }

  async ready() {
    await super.ready();
    await this.mainNavBar.ready();
    await this.planTab.ready();
    await this.analyseTab.ready();
    await this.createTab.ready();
  }

  async gotoPlanTab(): Promise<Planner> {
    await this.planTab.clickWhenReady();
    // NOTE: outside the dialog is outside of $(this)
    let planner  = new Planner(this.spaceName);
    await planner.open();
    return planner;
  }
}

// The main page that represents a Space
export class SpaceDashboardPage extends BasePage {

 /* Dialog to create new space and project */
  newSpaceName = $('#name');
  createSpaceButton = $('#createSpaceButton');
  devProcessPulldown = $('#developmentProcess');

  /* Analyze/Plan/Create - Navigation bar elements unique to space home display */
  headerAnalyze = element(by.xpath('.//*[contains(text(),\'Analyze\')]'));
  headerPlan = element(by.xpath('.//*[contains(text(),\'Plan\')]'));

  /* Dialog to create new project/add to space */
  // tslint:disable:max-line-length
  wizardStepTitle = element(by.xpath('.//*[contains(@class,\'wizard-step-title\') and contains(text(),\'Quickstart\')]'));
  // tslint:enable:max-line-length
  closeButton = $('#pficon.pficon-close');
  cancelButton = this.wizardStepTitle.element(by.buttonText('Cancel'));

  /* Associate github repo in code base */
  gitHubRepo = $('#gitHubRepo');

  /* UI Page Section: Analyze Overview (main body of page Bar */

  /* UI Page Section: Codebases */
  codebases = $('#spacehome-codebases-card');

  /* Codebases section title/link */
  codebasesSectionTitle = $('#spacehome-codebases-title');

  /* Codebases create code base link */
  // tslint:disable:max-line-length
  codebasesCreateLink = element(by.xpath('.//*[contains(@class,\'card-pf-title\')]/..//*[contains(text(), \'Create Codebase\')]'));
  addCodebaseButton = this.codebases.element(by.buttonText('Add Codebase'));

  /* UI Page Section: Analytics/Stack Reports */
  stackReports = $('#spacehome-analytical-report-card');

  /* Stack/Analytical Reports */
  stackReportsSectionTitle = $('#spacehome-analytical-report-title');
  stackReportsButton = new Button(element (by.xpath('.//*[contains(@class,\'stack-reports-btn\')]')), 'Stack Report ...');
  analyticsCloseButton = new Button(element (by.xpath('.//*[contains(text(),\'Stack report for\')]/../button')), 'Analytics Close Button ...');
  detailedReportHeading = element (by.xpath('.//*[contains(text(),\'Show complete stack report\')]/..'));
   // tslint:enable:max-line-length

  /* UI Page Section: My Workitems */
  workitems = $('#spacehome-my-workitems-card');

  /* My Workitems section title/link */
  workitemsSectionTitle = $('#spacehome-my-workitems-title');
  createWorkitemButton = $('#spacehome-my-workitems-create-button');

  /* UI Page Section: Pipelines */
  pipelines = $('#spacehome-pipelines-card');

  /* Pipelines section title/link */
  pipelinesSectionTitle = $('#spacehome-pipelines-title');
  addToSpaceButton = new Button($('#analyze-overview-add-to-space-button'), 'Add to space');

  /* UI Page Section: Environments */
  environments = $('spacehome-environments-card');

  /* Environments section title/link */
  environmentsSectionTitle = $('#spacehome-environments-title');

  /* The "Create" subpage of the space home page */
  headerCreate = element(by.xpath('.//*[contains(text(),\'Create\')]'));
  headerCodebases = element(by.xpath('.//*[contains(text(),\'Codebases\')]'));

  /* Pipelines tab under Create */
  headerPipelines = element(by.xpath('.//span[contains(text(),\'Pipelines\')]'));

  /* Workspaces tab under Create */
  createWorkspace = element(by.xpath('.//codebases-item-workspaces[1]'));

  /* Fade-in background for when the add to space dialog is present */
  fadeIn = element(by.xpath('.//*[contains(@class,\'modal-backdrop fade in\')]'));
  modalFade = element(by.xpath('.//*[contains(@class,\'modal fade\')]'));
  wizardSidebar = element(by.xpath('.//*[contains(@class,\'wizard-pf-sidebar\')]'));

  header = new SpaceDashboardPageHeader($('ul.nav.navbar-nav.navbar-primary.persistent-secondary'));
  spaceName: string;

  constructor(spaceName: string) {
    super(spaceName);

    // TODO: create a better way to access globals like username
    this.url = `${browser.params.login.user}/${spaceName}`;
  }

  async ready() {
    await super.ready();
    await this.addToSpaceButton.ready();
  }

  async addToSpace(): Promise<AddToSpaceDialog> {
    await this.addToSpaceButton.clickWhenReady();
    // NOTE: outside the dialog is outside of $(this)
    let wizard  = new AddToSpaceDialog($('body > modal-container > div.modal-dialog'));

    await wizard.open();
    return wizard;
  }

}
