// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { SettingsService } from 'src/app/svc/settings.service';
import { UserManager } from 'oidc-client';

@Component({
  templateUrl: './oidc-silent.component.html',
  styleUrls: ['./oidc-silent.component.scss']
})
export class OidcSilentComponent {

  constructor(
    private config: SettingsService,
  ) {
    new UserManager(config.settings.oidc).signinSilentCallback();
  }

}

