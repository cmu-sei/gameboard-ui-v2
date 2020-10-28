// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

