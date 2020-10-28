// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { MemberPresence } from 'src/app/models';
import { TeamService } from 'src/app/svc/team.service';
import { BaseComponent } from '../base.component';
import { MessageService } from '../../svc/message.service';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent extends BaseComponent {
  @Input() presence: MemberPresence;
  @Input() isOwner: boolean;
  @Input() isLocked: boolean;
  @Input() showOwnerBadge: boolean;

  constructor(
    private main: HomeComponent,
    private teamSvc: TeamService,
    msgSvc: MessageService) {
    super();
  }

  remove(confirmed: boolean) {
    if (confirmed) {
      const query = this.isOwner
        ? this.teamSvc.removeUser(this.presence.teamId, this.presence.id)
        : this.teamSvc.leave(this.presence.teamId);

      this.subs.push(query.subscribe(
        result => { if (result) { /* ? */ } },
        e => this.main.error(e)));
    }
  }

  action(): string {
    return this.presence.self
      ? 'Leave'
      : 'Kick';
  }
}

