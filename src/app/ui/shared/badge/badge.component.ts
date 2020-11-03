/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE
MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO
WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING,
BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY,
EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON
UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM
PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see LICENSE.md or contact
permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release
and unlimited distribution.  Please see Copyright notice for non-US Government
use and distribution.

DM20-0284
*/

import { Component, Input } from '@angular/core';
import { SettingsService, BadgeSettings, BadgeItem } from 'src/app/svc/settings.service';

@Component({
  selector: 'badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  badgeSettings: BadgeSettings;

  badgeItem: BadgeItem;

  constructor(private settingsService: SettingsService) {
    this.badgeSettings = settingsService.settings.badge;
  }

  _badge: string;

  @Input()
  set badge(value: string)
  {
    this._badge = value;
    let badgeItem = this.badgeSettings.items.find(x => x.key === this._badge);

    if (!badgeItem) {
      badgeItem = {
        key: this._badge,
        css: this.badgeSettings.defaults.iconCss,
        type: 'text'
      };
    }

    this.badgeItem = badgeItem;
  }
  get badge(): string { return this._badge; }

  @Input() disabled: boolean;

  get outerClass(): string {
    if (this.disabled) return this.badgeSettings.defaults.disabledIconCss;;
    return this.badgeItem.css;
  }

  get innerClass(): string {
    let css: string = '';

    if (this.disabled) css = this.badgeSettings.defaults.disabledTextCss;
    else css = this.badgeSettings.defaults.textCss;

    if (this.badgeItem.type === 'icon') {
      css += ' ' + this.badgeItem.icon;
    }

    return css;
  }
}

