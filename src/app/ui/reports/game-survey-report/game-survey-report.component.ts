// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChallengeSurveyReport, UserProfile } from '../../../models';
import { SettingsService } from '../../../svc/settings.service';
import { UserService } from '../../../svc/user.service';
import { BaseComponent } from '../../base.component';
import { HomeComponent } from '../../home/home.component';
import { GameService } from '../../../svc/game.service';

@Component({
  selector: 'app-game-survey-report',
  templateUrl: './game-survey-report.component.html',
  styleUrls: ['./game-survey-report.component.scss']
})
export class GameSurveyReportComponent extends BaseComponent implements OnInit {   
  profile: UserProfile;
  isModerator = false;
  report: ChallengeSurveyReport;  

  constructor(
    private main: HomeComponent,
    private userService: UserService,
    private gameService: GameService,
    private config: SettingsService,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.subs.push(this.userService.user$.subscribe(
      profile => {
        this.profile = profile;
        this.isModerator = profile && profile.user.isModerator;
        this.load();
      }, err => this.main.error(err)));
  }  

  export() {
    this.gameService.exportSurveyReport();
  }

  load() {
    if (!this.isModerator) {
      this.router.navigate(['/']);
    }
    else {
      this.subs.push(this.gameService.loadSurveyReport().subscribe(result => {
        this.report = result;
      }, err => this.main.error(err)));
    }
  }
}

