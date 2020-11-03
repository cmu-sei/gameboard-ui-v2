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

