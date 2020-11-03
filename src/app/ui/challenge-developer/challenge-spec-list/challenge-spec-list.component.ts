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

import { Component, OnInit } from '@angular/core';
import { ChallengeSpecService } from 'src/app/svc/challenge-spec.service';
import { ChallengeSpec, PagedResult, DataFilter, UserProfile } from 'src/app/models';
import { BaseComponent } from '../../base.component';
import { UserService } from '../../../svc/user.service';
import { HomeComponent } from '../../home/home.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-challenge-spec-list',
  templateUrl: './challenge-spec-list.component.html',
  styleUrls: ['./challenge-spec-list.component.scss']
})
export class ChallengeSpecListComponent extends BaseComponent implements OnInit {
  isChallengeDeveloper = false;
  result: PagedResult<ChallengeSpec>;
  dataFilter: DataFilter = { sort: 'slug', filter: '', skip: 0, take: 100, term: '' };
  multi: string = 'all';

  constructor(
    private main: HomeComponent,
    public challengeSpecService: ChallengeSpecService,
    private userSvc: UserService,
    private router: Router) {
    super();
  }

  ngOnInit() {
    this.initDataFilter();
    this.search();

    this.subs.push(this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        this.isChallengeDeveloper = profile && profile.user.isChallengeDeveloper;
        if (!(this.isChallengeDeveloper)) {
          this.router.navigate(['/']);
        }
      }, err => this.main.error(err)
    ));
  }

  initDataFilter() {
    let dataFilter = this.getStorageItem<DataFilter>('challenge-spec-list');

    if (!!dataFilter) {
      this.dataFilter = dataFilter;
    }

    if (!!this.dataFilter.filter) {
      let pairs = this.dataFilter.filter.split('|');

      pairs.forEach(p => {
        let kv = p.split('=');

        if (kv.length == 1) {
          let key = kv[0];

          if (key === 'multipart') {
            this.multi = 'multipart';
          }

          if (key === 'multistage') {
            this.multi = 'multistage';
          }
        }
      })
    }
  }

  filterMulti() {
    this.reset();
  }

  reset() {
    this.dataFilter.skip = 0;
    this.search();
  }

  sort(name: string): void {
    let newSort: string = name.replace('-', '');

    let sort = this.dataFilter.sort;
    let clean = sort.replace('-', '');

    if (clean === newSort) {
      this.dataFilter.sort = (sort.startsWith('-') ? '' : '-')
        + name;
    }
    else {
      this.dataFilter.sort = name;
    }

    this.search();
  }

  search() {
    this.dataFilter.filter = this.getFilter();

    this.subs.push(this.challengeSpecService.loadAll(this.dataFilter)
      .subscribe(result => {
        this.result = result;
        this.setStorageItem('challenge-spec-list', this.dataFilter);
      })
    );
  }

  getFilter(): string {
    let filters: string[] = [];
    if (this.multi != 'all') {
      filters.push(this.multi)
    }

    return filters.join('|');
  }

  isMultiPart(c: ChallengeSpec): boolean {
    if (c.isMultiStage)
      return false;

    let mpf = c.flags.filter(f => f.tokens && f.tokens.length > 1);
    return mpf != null && mpf.length > 0; // check for not IsMultiStage
  }

  isMultiStage(c: ChallengeSpec): boolean {
    return c.isMultiStage;
  }

  createRange(x) {
    const items: number[] = [];
    for (var i = 1; i <= x; i++) items.push(i);
    return items;
  }

  getTags(value: string): string[] {
    if (value) {
      return value.split(',').map(x => x.trim());
    }

    return [];
  }
}

