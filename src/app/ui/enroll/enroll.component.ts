// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

