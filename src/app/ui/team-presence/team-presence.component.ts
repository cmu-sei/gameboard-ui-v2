// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnDestroy, OnInit } from '@angular/core';
import { timer } from 'rxjs';
import { MemberPresence, TeamDetail, UserProfile } from 'src/app/models';
import { NotificationService } from 'src/app/svc/notification.service';
import { SettingsService } from 'src/app/svc/settings.service';
import { TeamService } from 'src/app/svc/team.service';
import { UserService } from 'src/app/svc/user.service';
import { MessageService } from '../../svc/message.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-team-presence',
  templateUrl: './team-presence.component.html',
  styleUrls: ['./team-presence.component.scss']
})
export class TeamPresenceComponent extends BaseComponent implements OnInit, OnDestroy {
  profile: UserProfile;
  team: TeamDetail;
  members: Array<MemberPresence> = [];
  showLogo: boolean;

  constructor(
    private main: HomeComponent,
    private config: SettingsService,
    private notifier: NotificationService,
    private userSvc: UserService,
    private teamSvc: TeamService,
    msgSvc: MessageService
  ) { super(); }

  ngOnInit() {

    this.showLogo = this.config.settings.showLogos;

    this.subs.push(this.userSvc.user$.subscribe(profile => {
      this.profile = profile;
      this.team = (!!profile) ? profile.team : null;
      if (!this.team) {
        this.members = [];
      } else {
        timer(3000).subscribe(() => {
          this.notifier.mergeMembers(
            this.team.members.map<MemberPresence>(
              u => ({
                id: u.id,
                name: u.name,
                teamId: u.teamId,
              })
            )
          );
        });
      }
    }, e => this.main.error(e)));

    this.subs.push(
      this.notifier.members$.subscribe(
        (list: Array<MemberPresence>) => {
          this.members = list;
        }, e => this.main.error(e)));
  }

  sortByName() {
    return this.members
      .filter(m => !!m.name)
      .sort((a, b) => a.name.localeCompare(b.name));
      //.sort((a, b) => a.online === b.online ? 0 : 1);
  }

  trackPresenceId(i: number, presence: MemberPresence) {
    return (!!presence) ? presence.id : null;
  }

  canKick(member: MemberPresence) {
    if (!member) { return false; }
    return !member.self
      && !this.profile.team.isLocked
      && this.profile.user.id === this.profile.team.ownerUserId;
  }

  kick(member: MemberPresence) {
    this.teamSvc.removeUser(this.profile.team.id, member.id).subscribe();
  }
}

