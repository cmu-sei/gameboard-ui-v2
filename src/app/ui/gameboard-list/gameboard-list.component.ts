// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

