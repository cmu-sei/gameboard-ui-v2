// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

