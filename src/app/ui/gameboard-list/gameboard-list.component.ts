/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Component, OnInit, Input } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { BoardService } from 'src/app/svc/board.service';
import { BoardDetail, TeamDetail, UserDetail, UserProfile } from '../../models';
import { NotificationService } from '../../svc/notification.service';
import { SettingsService } from '../../svc/settings.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { Router } from '@angular/router';
import { LoggerService } from '../../svc/logger.service';

@Component({
  selector: 'app-gameboard-list',
  templateUrl: './gameboard-list.component.html',
  styleUrls: ['./gameboard-list.component.scss']
})
export class GameboardListComponent extends BaseComponent implements OnInit {
  @Input() boards: BoardDetail[];
  @Input() profile: UserProfile;

  user: UserDetail = null;  
  statusCheck$: Subject<boolean> = new Subject<boolean>();  

  constructor(
    private main: HomeComponent,
    private config: SettingsService,
    private boardSvc: BoardService,
    private router: Router,
    private notificationSvc: NotificationService,
    private logger: LoggerService
  ) { super(); }

  ngOnInit() {
    this.subs.push(interval(1000).subscribe(_ => { this.setBoardStatus(); }));    
  }

  setBoardStatus() {
    this.logger.log('boards', this.boards);

    if (this.boards && this.profile && this.profile.team && this.profile.team.teamBoards) {
      this.logger.log('teamBoards', this.profile.team.teamBoards);

      this.boards.forEach(b => {
        const tb = this.profile.team.teamBoards.find(t => t.board.id === b.id);
        if (!!tb) {
          // if team board found, set score
          b.score = tb.score;
        }
        else {
          // if team board was reset or deleted, clear previous score
          b.score = null;
        }
        this.boardSvc.updateBoardState(b);
      });
    }
    else {

    }
  }

  showClosedMessage(board: BoardDetail): void {
    this.main.warning(board.name + ' has not started.');
  }
}

