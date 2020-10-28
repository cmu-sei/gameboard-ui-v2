// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { DataFilter, PagedResult, UserSummary, OrganizationDetail, UserDetail } from '../../models';
import { SettingsService } from '../../svc/settings.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { TeamService } from 'src/app/svc/team.service';
import { Observable } from 'rxjs';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent extends BaseComponent implements OnInit {
  @ViewChild('confirmModal', { static: false }) confirmModal: ModalDirective;
  isModerator = false;
  isObserver: boolean;
  isTestMode: boolean = false;

  users: PagedResult<UserSummary>;
  dataFilter: DataFilter = { sort: 'name', filter: '', skip: 0, take: 50, term: '' };
  organizations: OrganizationDetail[] = [];

  moderator = false;
  observer = false;
  challengeDeveloper = false;
  gameDesigner = false;
  organization = '';  

  pending: boolean = false;
  confirm: Confirm;

  constructor(
    private main: HomeComponent,
    private config: SettingsService,
    private userSvc: UserService,
    private teamService: TeamService,
    private router: Router)
  {
    super();

    this.isTestMode = config.settings.environment.mode === 'Test';
  }

  ngOnInit() {

    this.initDataFilter();

    this.subs.push(this.teamService.getOrganizations().subscribe(data => {
      this.organizations = data;
    }));

    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.isModerator = profile && profile.user.isModerator;
        this.isObserver = profile && profile.user.isObserver;

        if (!(this.isModerator || this.isObserver)) {
          this.router.navigate(['/']);
        }

        this.search();

      }, err => this.main.error(err)));
  }

  initDataFilter() {
    let dataFilter = this.getStorageItem<DataFilter>('user-list');

    if (!!dataFilter) {
      this.dataFilter = dataFilter;
    }

    if (!!this.dataFilter.filter) {
      let pairs = this.dataFilter.filter.split('|');

      pairs.forEach(p => {
        let kv = p.split('=');

        if (kv.length == 1) {
          let key = kv[0];

          if (key === 'moderator') {
            this.moderator = true;
          }

          if (key === 'observer') {
            this.observer = true;
          }

          if (key === 'challengeDeveloper') {
            this.challengeDeveloper = true;
          }

          if (key === 'gameDesigner') {
            this.gameDesigner = true;
          }
        }
        else if (kv.length == 2) {
          let key = kv[0];
          let value = kv[1];          
          
          if (key === 'organization') {
            this.organization = value;
          }          
        }
      })
    }
  }

  togglePermission(u: UserSummary, role: string) {
    var r = role.toLowerCase();
    switch (r)
    {
      case 'observer':
        this.subs.push(this.userSvc.toggleObserver(u.id).subscribe(result => {
          u.isObserver = result.isObserver;
          if (u.isObserver)
            this.main.success('Observer permission granted to user.');
          else
            this.main.warning('Observer permission removed from user.');

        }, err => this.main.error(err)));
        break;
      case 'moderator':
        this.subs.push(this.userSvc.toggleModerator(u.id).subscribe(result => {
          u.isModerator = result.isModerator;
          if (u.isModerator)
            this.main.success('Moderator permission granted to user.');
          else
            this.main.warning('Moderator permission removed from user.');

        }, err => this.main.error(err)));
        break;
      case 'gamedesigner':
        this.subs.push(this.userSvc.toggleGameDesigner(u.id).subscribe(result => {
          u.isGameDesigner = result.isGameDesigner;
          if (u.isGameDesigner)
            this.main.success('Game Designer permission granted to user.');
          else
            this.main.warning('Game Designer permission removed from user.');

        }, err => this.main.error(err)));
        break;
      case 'challengedeveloper':
        this.subs.push(this.userSvc.toggleChallengeDeveloper(u.id).subscribe(result => {
          u.isChallengeDeveloper = result.isChallengeDeveloper;
          if (u.isChallengeDeveloper)
            this.main.success('Challenge Developer permission granted to user.');
          else
            this.main.warning('Challenge Developer permission removed from user.');

        }, err => this.main.error(err)));
        break;
    }
  }

  resetUser(user: UserDetail): void {
    this.confirm = {
      type: 'reset-user',
      value: user,
      title: 'Reset ' + user.name,
      message: 'Are you sure you want to reset ' + user.name + '? This cannot be undone.'
    };

    this.confirmModal.show();
  }


  onConfirm(): void {

    let request: Observable<UserDetail> = null;
    let message: string = '';

    switch (this.confirm.type) {
      case 'reset-user':
        const resetTeam = this.confirm.value as UserDetail;
        request = this.userSvc.reset(resetTeam.id);
        message = 'User reset';
        break;
    }

    if (!!request) {
      if (!this.pending) {
        this.pending = true;
        this.subs.push(request.subscribe(
          (result) => {
            this.main.success(message + ' was successful.');
            this.reset();
          },
          err => {
            this.pending = false;
            this.confirm = null;
            this.confirmModal.hide();

            this.main.error(err);
          },
          () => {
            this.pending = false;
            this.confirm = null;
            this.confirmModal.hide();
          }));
      }
    }
    else {
      this.confirm = null;
      this.confirmModal.hide();
    }
  }
  
  reset() {
    this.dataFilter.skip = 0;
    this.search();
  }

  search() {
    this.subs.push(this.userSvc.loadAll(this.dataFilter).subscribe(result => {
      this.dataFilter = result.dataFilter;
      this.setStorageItem('user-list', this.dataFilter);
      this.users = result;
    }, err => this.main.error(err)));
  }

  onSortChanged() {
    this.search();
  }

  onFilterChanged() {
    const filter: string[] = [];
    if (this.organization !== '') {
      filter.push('organization=' + this.organization);
    }

    if (this.moderator) {
      filter.push('moderator');
    }

    if (this.observer) {
      filter.push('observer');
    }

    if (this.challengeDeveloper) {
      filter.push('challengedeveloper');
    }

    if (this.gameDesigner) {
      filter.push('gamedesigner');
    }

    this.dataFilter.filter = filter.join('|');

    this.reset();
  }

}

class Confirm {
  type?: string;
  value?: UserDetail;
  title?: string;
  message?: string;
}

