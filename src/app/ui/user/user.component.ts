// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { BoardDetail, LeaderboardScore, MemberPresence, TeamDetail, UserProfile } from 'src/app/models';
import { AuthService } from 'src/app/svc/auth.service';
import { LeaderboardService } from 'src/app/svc/leaderboard.service';
import { NotificationService } from 'src/app/svc/notification.service';
import { SettingsService } from 'src/app/svc/settings.service';
import { UserService } from 'src/app/svc/user.service';
import { GameService } from '../../svc/game.service';
import { MessageService } from '../../svc/message.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { LoggerService } from '../../svc/logger.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent extends BaseComponent implements OnInit {
  profile: UserProfile;
  activeBoardId: string;
  board: BoardDetail;
  status: LeaderboardScore;
  showLogo: boolean;
  multiplayer: boolean;
  minTeamSize: number;
  maxTeamSize: number;
  registrationMessage = '';
  idUrl: string;
  members: number;
  locked: boolean;
  isAllowed: boolean = false;
  isModerator: boolean = false;
  isObserver: boolean = false;
  isChallengeDeveloper: boolean = false;
  isGameDesigner: boolean = false;
  isTestMode: boolean = false;  

  checklist = [
    { needs: true, text: 'Organization', check: () => this.needsOrg(), fail: 'Choose your organization', pass: 'Organization',
      path: '/enroll/organization' },
    {
      needs: true, text: 'Enrollment', check: () => this.needsEnrollment(), fail: 'Edit Enrollment', pass: 'Enrollment created!',
      path: '/enroll/enrollment' },
    { needs: true, text: 'Teammates', check: () => this.needsTeammates(), fail: 'Invite teammates', pass: 'Colleagues enlisted!',
      path: '/enroll/teammates' },
    { needs: true, text: 'Confirm', check: () => this.needsLocked(), fail: 'Finalize enrollment', pass: 'Enrolled!',
      path: '/enroll/confirm' }
  ];

  constructor(
    private main: HomeComponent,
    private config: SettingsService,
    private userSvc: UserService,
    private authSvc: AuthService,
    msgSvc: MessageService,
    private leaderSvc: LeaderboardService,
    private gameService: GameService,
    private notifier: NotificationService,
    private logger: LoggerService
  ) {
    super();

    this.isTestMode = config.settings.environment.mode === 'Test';
  }

  ngOnInit() {
    this.showLogo = this.config.settings.showLogos;
    this.idUrl = this.config.settings.oidc.authority;
    this.isAllowed = this.config.canEnroll();
    
    this.subs.push(this.config.currentBoard$.subscribe(
      board => {
        this.board = board;        
      }, e => this.main.error(e)
    ));

    this.subs.push(this.gameService.getDefault().subscribe(
      game => {
        this.minTeamSize = game.minTeamSize;
        this.maxTeamSize = game.maxTeamSize;
        this.multiplayer = game.maxTeamSize > 1;

        if (!this.multiplayer) {
          this.checklist.splice(2, 1);
        }
      }, e => this.main.error(e)
    ));

    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.logger.log('UserComponent.user', profile);
        this.profile = profile;
        this.updateChecklist();
        this.isModerator = profile && profile.user && profile.user.isModerator;
        this.isObserver = profile && profile.user && profile.user.isObserver;
        this.isChallengeDeveloper = profile && profile.user && profile.user.isChallengeDeveloper;
        this.isGameDesigner = profile && profile.user && profile.user.isGameDesigner;
      }, err => this.main.error(err)));

    this.subs.push(this.notifier.teamUpdates$.subscribe(
      (team: TeamDetail) => {
        this.logger.log('UserComponent.teamUpdated', team);
        this.profile.team = { ...this.profile.team, ...team };        
        this.updateChecklist();
      }, err => this.main.error(err)
    ));

    this.subs.push(this.notifier.members$.subscribe(
      (members: MemberPresence[]) => {
        this.members = members.length;
        this.updateChecklist();
      }, err => this.main.error(err)
    ));
  }

  login() {
    this.authSvc.externalLogin(this.authSvc.redirectUrl);
  }

  logout() {
    this.authSvc.logout();
  }

  needsOrg() {
    return !this.profile || !this.profile.user || !this.profile.user.organization;
  }

  needsEnrollment() {
    return !this.profile || !this.profile.team;
  }

  needsTeammates() {
    return this.multiplayer &&
      (!this.profile || !this.profile.team || this.members < this.minTeamSize);
  }

  needsLocked() {
    return !this.profile || !this.profile.team || !this.profile.team.isLocked;
  }
  
  updateChecklist() {
    this.locked = this.profile && this.profile.team && this.profile.team.isLocked;
    this.checklist.forEach(item => {
      item.needs = item.check();
    });
  }  
}

