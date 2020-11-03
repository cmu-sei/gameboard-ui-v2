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

