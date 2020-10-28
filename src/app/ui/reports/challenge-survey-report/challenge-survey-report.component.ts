/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

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

