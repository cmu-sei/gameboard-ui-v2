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
import { MemberPresence, TeamDetail, UserProfile } from 'src/app/models';
import { SettingsService } from 'src/app/svc/settings.service';
import { UserService } from 'src/app/svc/user.service';
import { MessageService } from '../../svc/message.service';
import { NotificationService } from '../../svc/notification.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { GameService } from '../../svc/game.service';

@Component({
  selector: 'app-enroll',
  templateUrl: './enroll.component.html',
  styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent extends BaseComponent implements OnInit {

  isLocked: boolean;
  isAllowed = false;
  multiplayer: boolean = false;
  minTeamSize: number;
  profile: UserProfile;
  members: MemberPresence[] = [];

  hasOrganization: boolean = false;
  hasEnrollment: boolean = false;
  hasMembers: boolean = false;
  hasComplete: boolean = false;

  constructor(
    private main: HomeComponent,
    private userSvc: UserService,
    msgSvc: MessageService,
    private config: SettingsService,
    private notifier: NotificationService,
    private gameService: GameService
  ) {
    super();
  }

  ngOnInit() {

    this.subs.push(this.gameService.getDefault().subscribe(
      game => {
        this.minTeamSize = game.minTeamSize;
        this.multiplayer = game.isMultiplayer;
        this.setWorkflow();
      }, e => this.main.error(e)
    ));

    this.isAllowed = this.config.canEnroll();

    this.subs.push(this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        this.profile = profile;
        this.isLocked = profile && profile.team && profile.team.isLocked;
        this.setWorkflow();
      }, e => this.main.error(e)
    ));

    this.subs.push(this.notifier.teamUpdates$.subscribe(
      (team: TeamDetail) => {
        this.profile.team = { ...this.profile.team, ...team };
        this.setWorkflow();
      }, err => this.main.error(err)
    ));

    this.subs.push(this.notifier.members$.subscribe(
      (members: MemberPresence[]) => {
        this.members = members;
        this.setWorkflow();
      }, err => this.main.error(err)
    ));    
  }

  setWorkflow(): void {
    if (this.profile) {
      this.hasOrganization = this.profile.user != null &&
        this.profile.user.organization != null;

      this.hasEnrollment = this.profile.team != null;

      this.hasMembers = this.profile.team != null &&
        this.members.length >= this.minTeamSize;

      this.hasComplete = this.profile.team != null &&
        this.profile.team.isLocked;
    }
  }
}

