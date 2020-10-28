// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

