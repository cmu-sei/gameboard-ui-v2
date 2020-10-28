// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { BoardService } from 'src/app/svc/board.service';
import { ChallengeProblem, TeamBoardDetail, TokenDetail, UserProfile } from '../../../models';
import { ChallengeService } from '../../../svc/challenge.service';
import { LoggerService } from '../../../svc/logger.service';
import { NotificationService } from '../../../svc/notification.service';
import { SettingsService } from '../../../svc/settings.service';
import { UserService } from '../../../svc/user.service';
import { BaseComponent } from '../../base.component';
import { AuthService } from '../../../svc/auth.service';

@Component({
  selector: 'app-challenge-print',
  templateUrl: './challenge-print.component.html',
  styleUrls: ['./challenge-print.component.scss']
})
export class ChallengePrintComponent extends BaseComponent implements OnInit, OnDestroy {
  load$: Subscription;
  challengeId: string;
  challengeProblem: ChallengeProblem;
  teamBoard: TeamBoardDetail;
  initializing = false;
  profile: UserProfile;
  timeRemaining: number;
  disabledCount: number = -1;
  updatingState: boolean = false;
  loading: boolean = false;

  constructor(
    private authSvc: AuthService,
    private location: Location,
    private challengeService: ChallengeService,
    private boardSvc: BoardService,
    private notificationSvc: NotificationService,
    private route: ActivatedRoute,
    private userSvc: UserService,
    settingsService: SettingsService,
    private logger: LoggerService
  ) {
    super();
  }

  ngOnInit() {
    this.challengeId = this.route.snapshot.params.id;

    this.subs.push(this.notificationSvc.teamUpdates$.subscribe((team) => {
      this.profile.team = team;
      this.updateState()
      this.loadChallengeProblem();
    }));

    this.subs.push(this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        if (!!profile) {
          this.profile = profile;
        }

        this.updateState()
        this.loadChallengeProblem();
      },
    ));
  }

  loadChallengeProblem() {
    if (!this.profile || this.loading)
      return;

    this.logger.log('teamId:', this.profile.user.teamId);
    this.loading = true;

    this.load$ = this.challengeService.load(this.challengeId, this.profile.user.teamId).subscribe(result => {
      this.challengeProblem = result;
      this.challengeProblem.state = {};

      this.teamBoard = this.profile.team.teamBoards.find(t => t.board.id === result.board.id);
      this.updateState();
    },
      () => {
        this.load$.unsubscribe();
        this.loading = false;
      }
    );
  }

  updateState() {
    if (this.updatingState)
      return;

    if (this.challengeProblem) {
      this.updatingState = true;

      if (this.teamBoard) {
        this.boardSvc.updateBoardState(this.challengeProblem.board);
        this.boardSvc.updateTeamBoardState(this.teamBoard);
        this.timeRemaining = Math.min(this.challengeProblem.board.state.timespan, this.teamBoard.state.timespan);

        if (this.teamBoard.state.expired && this.challengeProblem.problem && this.challengeProblem.problem.status === 'Ready') {
          this.challengeProblem.problem.status = 'Complete';
          this.challengeProblem.problem.end = new Date(new Date(this.teamBoard.start).valueOf() + this.teamBoard.maxMinutes * 60000);
        }
      }

      this.challengeService.updateState(this.challengeProblem);
    }

    this.updatingState = false;
  }

  printChallengeInstructions() {
    window.print();
    window.close();
  }
}

