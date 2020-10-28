// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, TemplateRef } from '@angular/core';
import { UserProfile } from 'src/app/models';
import { SettingsService } from 'src/app/svc/settings.service';
import { UserService } from 'src/app/svc/user.service';
import { TeamService } from 'src/app/svc/team.service';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/svc/message.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BaseComponent } from '../../base.component';
import { HomeComponent } from '../../home/home.component';
import { GameService } from '../../../svc/game.service';

@Component({
  selector: 'app-enroll-complete',
  templateUrl: './enroll-complete.component.html',
  styleUrls: ['./enroll-complete.component.scss']
})
export class EnrollCompleteComponent extends BaseComponent implements OnInit {

  profile: UserProfile;
  teamSize  = 1;
  showTeamCreate: boolean;
  showInviteMsg: boolean;
  modalRef: BsModalRef;
  multiplayer: boolean;
  enrollmentMessage: string;

  constructor(
    private main: HomeComponent,
    private config: SettingsService,
    private userSvc: UserService,
    private teamSvc: TeamService,
    private router: Router,
    private gameService: GameService,
    private modalService: BsModalService,
    msgSvc: MessageService
  ) {
    super();
  }

  ngOnInit() {

    this.subs.push(this.gameService.getDefault().subscribe(
      game => {
        this.multiplayer = game.isMultiplayer;
        this.teamSize = game.maxTeamSize;
      }, e => this.main.error(e)
    ));
    
    this.enrollmentMessage = this.config.settings.branding.enrollmentMessage;
    this.subs.push(this.userSvc.user$.subscribe(
      user => this.profile = user,
      err => this.main.error(err)
    ));
  }

  teamExists() {
    return this.profile && this.profile.team;
  }

  canJoin() {
    return this.teamSize > 1 && !this.teamExists();
  }

  canEdit() {
    return this.teamExists() && this.isOwner() && !this.isLocked();
  }

  canInvite() {
    return this.teamSize > 1 && this.canEdit();
  }

  isLocked() {
    return this.teamExists() && this.profile.team.isLocked;
  }

  isOwner() {
    return this.teamExists() &&
      this.profile.team.ownerUserId === this.profile.user.id;
  }

  isMember() {
    return this.teamExists() && this.profile.team.ownerUserId !== this.profile.user.id;
  }

  lock() {
    this.modalRef.hide();

    this.teamSvc.lock(this.profile.team.id).subscribe(
      result => {
        this.profile.team.isLocked = true;
        if (this.multiplayer) {
          this.main.warning('Team is locked');
        }
        else {
          this.main.warning('Enrollment is locked');
        }
      }, (err) => this.main.error(err)
    );
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-dialog-centered modal-lg', animated: true, backdrop: 'static' });
  }

}

