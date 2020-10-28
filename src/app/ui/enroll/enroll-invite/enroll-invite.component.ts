/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Component, OnInit, Input, TemplateRef } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import { UserProfile } from 'src/app/models';
import { UserService } from 'src/app/svc/user.service';
import { TeamService } from 'src/app/svc/team.service';
import { NotificationService } from 'src/app/svc/notification.service';
import { timer } from 'rxjs';
import { SettingsService } from 'src/app/svc/settings.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HomeComponent } from '../../home/home.component';
import { MessageService } from '../../../svc/message.service';
import { GameService } from '../../../svc/game.service';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-enroll-invite',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  templateUrl: './enroll-invite.component.html',
  styleUrls: ['./enroll-invite.component.scss']
})
export class EnrollInviteComponent extends BaseComponent implements OnInit {

  profile: UserProfile;
  maxTeamSize: number;
  minTeamSize: number;
  multiplayer: boolean;
  copied: boolean;
  generated: boolean;
  url: string;
  modalRef: BsModalRef;

  constructor(
    private main: HomeComponent,
    private userSvc: UserService,
    private teamSvc: TeamService,
    private config: SettingsService,
    private modalService: BsModalService,
    msgSvc: MessageService,
    private notifier: NotificationService,
    private gameService: GameService,
    private locationStrat: LocationStrategy
  ) {
    super();
  }

  ngOnInit() {

    this.subs.push(this.gameService.getDefault().subscribe(
      game => {
        this.minTeamSize = game.minTeamSize;
        this.maxTeamSize = game.maxTeamSize;
        this.multiplayer = game.isMultiplayer;
      }, e => this.main.error(e)
    ));

    this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        this.profile = profile;
      }
    );
  }

  code() {
    this.subs.push(
      this.teamSvc.invite(this.profile.user.teamId).subscribe(result => {
        this.url = window.location.origin + this.locationStrat.prepareExternalUrl(
          '/enlist/' + result.invitationCode + '/team/' + this.profile.team.id
        );
        this.generated = true;
        timer(3000).subscribe(() => this.generated = false);
      }, err => this.main.error(err)));
  }

  copyToClipboard(code) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', this.url);
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    this.copied = true;
    timer(3000).subscribe(() => this.copied = false);
  }

  hasTeam() {
    return this.profile && this.profile.team;
  }

  canInvite() {
    return this.multiplayer && this.isOwner() && !this.isLocked();
  }

  isLocked() {
    return this.hasTeam() && this.profile.team.isLocked;
  }

  isOwner() {
    return this.hasTeam() &&
      this.profile.team.ownerUserId === this.profile.user.id;
  }

  isMember() {
    return this.hasTeam() && this.profile.team.ownerUserId !== this.profile.user.id;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-dialog-centered', animated: true, backdrop: 'static' });
  }
}

