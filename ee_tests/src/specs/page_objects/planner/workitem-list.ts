import { ElementFinder } from 'protractor';

import * as ui from '../../ui';
import { WorkItemQuickAdd } from './workitem-quick-add';

export class WorkItemList extends ui.BaseElement {
  overlay = new ui.BaseElement(this.$('div.lock-overlay-list'));

  constructor(el: ElementFinder, name = 'Work Item List') {
    super(el, name);
  }

  async ready() {
    await super.ready();
    await this.overlay.untilAbsent();
    await this.quickAdd.ready();
  }
}
