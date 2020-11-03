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

