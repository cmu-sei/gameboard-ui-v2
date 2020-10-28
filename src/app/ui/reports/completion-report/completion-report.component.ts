// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BoardDetail, BoardCompletionReport, UserProfile } from '../../../models';
import { BoardService } from '../../../svc/board.service';
import { SettingsService } from '../../../svc/settings.service';
import { UserService } from '../../../svc/user.service';
import { HomeComponent } from '../../home/home.component';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-completion-report',
  templateUrl: './completion-report.component.html',
  styleUrls: ['./completion-report.component.scss']
})
export class CompletionReportComponent extends BaseComponent implements OnInit {
  profile: UserProfile;
  isModerator = false;
  id: string;
  report: BoardCompletionReport;
  board: BoardDetail;
  isObserver: boolean;
  boards: BoardDetail[] = [];

  constructor(
    private main: HomeComponent,
    private userSvc: UserService,
    private boardSvc: BoardService,
    private config: SettingsService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {

    this.loadBoards();

    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.profile = profile;
        this.isModerator = profile && profile.user.isModerator;
        this.isObserver = profile && profile.user.isObserver;
      }, err => this.main.error(err)));

    if (!(this.isModerator || this.isObserver)) {
      this.router.navigate(['/']);
    }

    this.subs.push(this.config.currentBoard$.subscribe(result => {
      this.board = result;
      this.id = this.board.id;
    }));

    this.load();
  }

  onBoardChanged() {
    this.load();
  }

  loadBoards() {
    this.subs.push(
      this.boardSvc.list().subscribe(
        data => {
          this.boards = data;
        },
        err => this.main.error(err)
      )
    );
  }

  export() {
    this.boardSvc.exportBoardCompletionReport(this.id);
  }

  load() {
    if (!!this.id) {
      this.subs.push(this.boardSvc.loadCompletionReport(this.id).subscribe(result => {
        this.report = result;
      }, err => this.main.error(err)));
    }
  }
}

