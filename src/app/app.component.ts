// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

