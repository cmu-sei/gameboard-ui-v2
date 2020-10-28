/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

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

