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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthTokenState } from './svc/auth.service';
import { SettingsService } from './svc/settings.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  status$: Subscription;
  showExpiring: boolean;
  showExpired: boolean;
  public AppConfig: any;
  appName: string;
  isCollapsed = true;
  userExists: boolean;

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private settingsSvc: SettingsService,
    private titleSvc: Title
  ) {

  }
  ngOnInit() {
    this.appName = this.settingsSvc.settings.applicationName;
    this.setTitle(this.appName);

    this.status$ = this.authSvc.tokenState$.subscribe(
      (status) => {
        this.showExpiring = (status === AuthTokenState.expiring);
        if (status === AuthTokenState.expired) {
          this.clearExpiredUser();
        }
      });
  }

  public setTitle(newTitle: string) {
    this.titleSvc.setTitle(newTitle);
  }

  continue() {
    this.authSvc.silentLogin();
  }

  ngOnDestroy() {
    this.status$.unsubscribe();
  }

  clearExpiredUser() {
    sessionStorage.removeItem('currentUserId');
  }

  startSigninMainWindow() {
    this.authSvc.externalLogin('/');
  }

}

