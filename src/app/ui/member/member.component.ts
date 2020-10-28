/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

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

