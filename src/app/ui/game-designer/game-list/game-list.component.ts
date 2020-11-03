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
import { BaseComponent } from '../../base.component';
import { GameDetail, PagedResult, DataFilter } from '../../../models';
import { GameService } from '../../../svc/game.service';
import { HomeComponent } from '../../home/home.component';
import { UserService } from '../../../svc/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-list',
  templateUrl: './game-list.component.html',
  styleUrls: ['./game-list.component.scss']
})
export class GameListComponent extends BaseComponent implements OnInit {
  isGameDesigner = false;
  result: PagedResult<GameDetail>;
  dataFilter: DataFilter = { sort: 'id', filter: '', skip: 0, take: 10, term: '' };

  multi: string = 'all';

  constructor(
    public gameService: GameService,
    private main: HomeComponent,
    private userSvc: UserService,
    private router: Router) {
    super();
  }

  ngOnInit() {
    this.initDataFilter();
    this.search();

    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.isGameDesigner = profile && profile.user.isGameDesigner;

        if (!(this.isGameDesigner)) {
          this.router.navigate(['/']);
        }

      }, err => this.main.error(err)));
  }

  initDataFilter() {
    let dataFilter = this.getStorageItem<DataFilter>('game-list');

    if (!!dataFilter) {
      this.dataFilter = dataFilter;
    }

    if (!!this.dataFilter.filter) {
      let pairs = this.dataFilter.filter.split('|');

      pairs.forEach(p => {
        let kv = p.split('=');

        if (kv.length == 1) {
          let key = kv[0];
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

    this.subs.push(this.gameService.getAll(this.dataFilter)
      .subscribe(result => {
        this.result = result;
        this.setStorageItem('game-list', this.dataFilter);
      })
    );
  }

  getFilter(): string {
    let filters: string[] = [];    

    return filters.join('|');
  }
}

