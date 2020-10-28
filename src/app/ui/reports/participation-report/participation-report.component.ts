// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { OrganizationDetail, ParticipationReport } from '../../../models';
import { GameService } from '../../../svc/game.service';
import { ReportService } from '../../../svc/report.service';
import { SettingsService } from '../../../svc/settings.service';
import { TeamService } from '../../../svc/team.service';
import { BaseComponent } from '../../base.component';
import { HomeComponent } from '../../home/home.component';

@Component({
  selector: 'app-participation-report',
  templateUrl: './participation-report.component.html',
  styleUrls: ['./participation-report.component.scss']
})
export class ParticipationReportComponent extends BaseComponent implements OnInit {
  data?: ParticipationReport;  
  heading = '';
  organizations: OrganizationDetail[] = [];

  constructor(
    private main: HomeComponent,
    private reportSvc: ReportService,
    private teamService: TeamService,
    private gameService: GameService,
    private config: SettingsService
  ) {
    super();
  }

  ngOnInit() {

    this.subs.push(this.gameService.getDefault().subscribe(
      game => {        
        this.heading = game.isMultiplayer ? 'Teams' : 'Players';
      }, e => this.main.error(e)
    ));        

    this.subs.push(this.teamService.getOrganizations().subscribe(data => {
      this.organizations = data;

      this.subs.push(this.reportSvc.getParticipationReport().subscribe(
        (result) => {
          this.data = result;
          this.data.organizations.forEach(o => o.logo = this.organizations.find(c => c.name === o.name).logo);
        }));
    }));
  }
}

