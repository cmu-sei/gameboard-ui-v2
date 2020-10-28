// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BoardDetail, ChallengeSurveyReport, UserProfile, QuestionDetail } from '../../../models';
import { BoardService } from '../../../svc/board.service';
import { SettingsService } from '../../../svc/settings.service';
import { UserService } from '../../../svc/user.service';
import { BaseComponent } from '../../base.component';
import { HomeComponent } from '../../home/home.component';

@Component({
  selector: 'app-challenge-survey-report',
  templateUrl: './challenge-survey-report.component.html',
  styleUrls: ['./challenge-survey-report.component.scss']
})
export class ChallengeSurveyReportComponent extends BaseComponent implements OnInit {   
  profile: UserProfile;
  isModerator = false;
  id: string;
  report: ChallengeSurveyReport;
  board: BoardDetail;
  boards: BoardDetail[] = [];

  constructor(
    private main: HomeComponent,
    private userService: UserService,
    private boardService: BoardService,
    private config: SettingsService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {

    this.loadBoards();

    this.userService.user$.subscribe(
      profile => {
        this.profile = profile;
        this.isModerator = profile && profile.user.isModerator;
      }, err => this.main.error(err));

    if (!(this.isModerator)) {
      this.router.navigate(['/']);
    }

    this.subs.push(this.config.currentBoard$.subscribe(result => {
      this.board = result;
      this.id = this.board.id;
    }));

    if (this.id) {
      this.load();
    }
  }

  onBoardChanged() {
    this.load();
  }

  lastTitle: string;

  displayTitle(title: string) {
    if (title === this.lastTitle) {
      return false;
    }

    this.lastTitle = title;

    return true;
  }

  lastQuestion: string;

  displayQuestion(question: string) {
    if (question === this.lastQuestion) {
      return false;
    }

    this.lastQuestion = question;

    return true;
  }

  loadBoards() {
    this.subs.push(
      this.boardService.list().subscribe(
        data => {
          this.boards = data;
        },
        err => this.main.error(err)
      )
    );
  }

  export() {
    this.boardService.exportChallengeSurveyReport(this.id);
  }

  load() {
    if (!!this.id) {
      this.subs.push(this.boardService.loadChallengeSurveyReport(this.id).subscribe(result => {
        this.report = result;
      }, err => this.main.error(err)));
    }
  }
}

