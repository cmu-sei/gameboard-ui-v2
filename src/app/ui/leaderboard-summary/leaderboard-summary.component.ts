// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { BoardDetail, Leaderboard, LeaderboardScore, UserProfile } from '../../models';
import { LeaderboardService } from '../../svc/leaderboard.service';
import { MessageService } from '../../svc/message.service';
import { NotificationService } from '../../svc/notification.service';
import { SettingsService } from '../../svc/settings.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-leaderboard-summary',
  templateUrl: './leaderboard-summary.component.html',
  styleUrls: ['./leaderboard-summary.component.scss']
})
export class LeaderboardSummaryComponent extends BaseComponent implements OnInit {
  profile: UserProfile;
  board: BoardDetail;
  teamScore: LeaderboardScore;
  leaderboard: Leaderboard;

  constructor(
    private main: HomeComponent,
    private leaderboardSvc: LeaderboardService,
    private userSvc: UserService,
    private config: SettingsService,
    private notifier: NotificationService,
    msgSvc: MessageService
  ) { super(); }

  ngOnInit() {
    this.userSvc.user$.subscribe(
      (profile) => {
        this.profile = profile;
        if (!!profile) {
          this.loadSelf();
        }
      }
    );

    this.config.currentBoard$.subscribe(board => {
      this.board = board;
      this.load();
    });

    this.subs.push(this.notifier.leaderboardUpdated$
      .subscribe((leaderboard) => {
        if (this.board.id === leaderboard.boardId) {
          this.leaderboard = leaderboard;
        }
      }, e => this.main.error(e)
      ));
  }

  load() {
    if (this.board) {
      this.subs.push(this.leaderboardSvc.load(this.board.id, { take: this.config.settings.leaderPageSize, sort: 'rank' }).subscribe(
        leaderboard => {
          this.leaderboard = leaderboard;
        },
        e => this.main.error(e)));
    }
  }

  loadSelf() {
    if (this.profile && this.profile.user && this.profile.user.teamId && this.leaderboard) {
      this.leaderboardSvc.loadByTeam(this.leaderboard.boardId, this.profile.user.teamId)
        .subscribe(score => this.teamScore = score);
    }
  }

  scores(): Array<LeaderboardScore> {
    const a = this.leaderboard.results;
    for (let i = a.length; i < this.config.settings.leaderPageSize; i++) {
      this.leaderboard.results.push({ rank: i + 1, name: '-----' });
    }

    if (this.profile && this.profile.team) {
      const me = a.find(s => s.id === this.profile.team.id);
      if (me) {
        me.name = this.profile.team.name;
      } else {
        if (this.teamScore && this.teamScore.score > 0) {
          a.push({ name: ' . .' }, this.teamScore);
        }
      }
    }

    return a;
  }
}

