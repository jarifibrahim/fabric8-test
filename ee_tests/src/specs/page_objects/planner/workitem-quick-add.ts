import { WorkItem } from './../../support/core';
import { ElementFinder } from 'protractor';
import * as ui from '../../ui';

export class WorkItemQuickAdd extends ui.Clickable {
  titleTextInput = new ui.TextInput(this.$('input.f8-quickadd-input'), 'Work item Title');
  buttonsDiv = this.$('div.f8-quickadd__wiblk-btn.pull-right');
  acceptButton = new ui.Button(this.buttonsDiv.$('button.btn.btn-primary'), '✓');
  cancelButton = new ui.Button(this.buttonsDiv.$('button.btn.btn-default'), 'x');

  constructor(el: ElementFinder, name = 'Work Item Quick Add') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.untilClickable();
  }

  async createWorkItem({ title, description = '', type = 'feature' }: WorkItem) {
    await this.clickWhenReady();
    await this.titleTextInput.ready();
    await this.titleTextInput.enterText(title);
    await this.cancelButton.untilClickable();

    await this.acceptButton.clickWhenReady();

    // TODO add more confirmation that the item has been added
    await this.cancelButton.clickWhenReady();

    // TODO choose the type of item
    this.log('New WorkItem', `${title} added`);
  }
}
