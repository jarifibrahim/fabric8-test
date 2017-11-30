import { $, browser } from 'protractor';

import { AppPage } from '../app.page';
import { WorkItem } from './../../support/core';
import { WorkItemList } from './workitem-list';
import { WorkItemQuickAdd } from './workitem-quick-add';

// this is what you see when you click on the Plan Tab button
export class Planner extends AppPage {
  workItemList = new WorkItemList($('alm-work-item-list'));
  quickAdd =  new WorkItemQuickAdd($('#workItemList_quickAdd > alm-work-item-quick-add > div'));

  constructor(public spaceName: string) {
    super();
    this.url = `${browser.params.login.user}/${spaceName}/plan`;
  }

  async ready() {
    await super.ready();
    await this.workItemList.ready();
  }

  async createWorkItem(item: WorkItem) {
    this.debug('create item', JSON.stringify(item));
    await this.quickAdd.createWorkItem(item);
  }
}
