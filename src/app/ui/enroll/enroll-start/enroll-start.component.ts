/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Component, OnInit } from '@angular/core';
import { TeamCreate, TeamUpdate, UserProfile, TeamDetail } from 'src/app/models';
import { SettingsService } from 'src/app/svc/settings.service';
import { TeamService } from 'src/app/svc/team.service';
import { UserService } from 'src/app/svc/user.service';
import { Router } from '@angular/router';
import { HomeComponent } from '../../home/home.component';
import { BaseComponent } from '../../base.component';
import { GameService } from '../../../svc/game.service';
import { MessageService } from '../../../svc/message.service';

@Component({
  selector: 'app-enroll-start',
  templateUrl: './enroll-start.component.html',
  styleUrls: ['./enroll-start.component.scss']
})
export class EnrollStartComponent extends BaseComponent implements OnInit {

  profile: UserProfile;  
  org: string;
  multiplayer: boolean;
  logo: string;
  name: string;

  constructor(
    private main: HomeComponent,
    private config: SettingsService,
    private userSvc: UserService,
    private teamSvc: TeamService,
    private gameService: GameService,
    private router: Router,
    msgSvc: MessageService) {
    super();
  }

  ngOnInit() {

    this.subs.push(this.gameService.getDefault().subscribe(
      game => {
        this.multiplayer = game.isMultiplayer;
      }, e => this.main.error(e)
    ));

    this.subs.push(this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        this.profile = profile;
        if (this.profile) {

          this.subs.push(this.teamSvc.getOrganizations().subscribe(data => {
            this.logo = data.filter(o => o.name === this.profile.user.organization)
              .map(o => o.logo)
              .pop();
          }));

          this.name = this.profile.team ? this.profile.team.name : '';
        }
      }, e => this.main.error(e)
    ));
  }

  save() {
    if (this.profile.team) {
      if (this.profile.team.name === this.name) {
        this.saved(this.profile.team);
      }
      else {
        this.update();
      }      
    } else {
      this.add();      
    }
  }

  add() {
    const model: TeamCreate =
    {
      name: this.name,
      organizationName: this.profile.user.organization,
      organizationLogoUrl: this.logo
    }

    this.subs.push(this.teamSvc.create(model).subscribe(
      detail => {        
        this.saved(detail);
      }, err => this.main.error(err)
    ));
  }
  update() {
    const model: TeamUpdate =
    {
      id: this.profile.team.id,
      name: this.name,
      organizationName: this.profile.user.organization,
      organizationLogoUrl: this.logo
    }

    this.teamSvc.update(model.id, model).subscribe(
      detail => {        
        this.saved(detail);
      }, err => this.main.error(err)
    );
  }

  saved(detail: TeamDetail) {
    if (this.multiplayer) {
      this.main.success('Team Saved!');
    }
    else {
      this.main.success('Enrollment Saved!');
    }
    this.profile.team = detail;
    this.userSvc.reload();    
    if (this.multiplayer) {
      this.router.navigate(['/enroll/teammates']);
    }
    else {
      this.router.navigate(['/enroll/confirm']);
    }
  }
}

