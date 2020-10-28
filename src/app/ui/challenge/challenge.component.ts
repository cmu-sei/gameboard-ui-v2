// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { interval, Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { BoardService } from 'src/app/svc/board.service';
import { ChallengeProblem, ProblemDetail, SubmissionCreate, SubmissionDetail, TeamBoardDetail, TokenDetail, UserProfile, TokenStatusType } from '../../models';
import { ChallengeService } from '../../svc/challenge.service';
import { LoggerService } from '../../svc/logger.service';
import { NotificationService } from '../../svc/notification.service';
import { SettingsService } from '../../svc/settings.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { MarkdownService } from 'ngx-markdown';
import { networkInterfaces } from 'os';
import { Token } from '@angular/compiler/src/ml_parser/lexer';

@Component({
  selector: 'app-challenge',
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  templateUrl: './challenge.component.html',
  styleUrls: ['./challenge.component.scss']
})
export class ChallengeComponent extends BaseComponent implements OnInit, OnDestroy {
  load$: Subscription;
  id: string;
  challengeProblem: ChallengeProblem;
  teamBoard: TeamBoardDetail;
  showNav: boolean;
  tokens: TokenDetail[];
  initializing = false;
  eta = 0;
  etacountdown$: Subscription;
  profile: UserProfile;
  timeRemaining: number;
  showFlagConfirm = false;
  flagIsInvalid = false;
  timerStarted = false;
  disabledCount: number = -1;  
  updatingState: boolean = false;
  loading: boolean = false;
  flagIndices: number[] | undefined;
  flagIndex?: number | undefined = null;
  isTestMode: boolean = false;
  isRestartAllowed: boolean = false;
  resetMinutes: number = 2.0;
  showFlagIndexSelect: boolean = false;
  surveyMessage: string = "Feedback is welcome for this challenge. Feedback is not monitored and should not be used for help desk requests. Feedback cannot be changed once submitted."
  modalRef: BsModalRef;

  constructor(
    private main: HomeComponent,
    private location: Location,
    private challengeService: ChallengeService,
    private boardSvc: BoardService,
    private notificationSvc: NotificationService,
    private route: ActivatedRoute,
    private userSvc: UserService,
    private modalService: BsModalService,
    settingsService: SettingsService,
    private logger: LoggerService,
    locationStrat: LocationStrategy,
    markdownSvc: MarkdownService,
    private router: Router
  ) {
    super();

    this.isTestMode = settingsService.settings.environment.mode === 'Test';
    if (!!settingsService.settings.environment.resetMinutes) {
      this.resetMinutes = settingsService.settings.environment.resetMinutes;
    }

    this.logger.log('isTestMode', this.isTestMode);
    this.logger.log('resetMinutes', this.resetMinutes);

    const basehref = locationStrat.getBaseHref();

    markdownSvc.renderer.link = (href, title, text) => {
      if (href.match(/\/console\//)) {
        href = href.replace(/\/console\//, basehref + 'console/');
        return `
                  <a class="btn btn-secondary btn-vm"
                      href=${href} target="_blank" rel="noopener noreferrer">
                      <i class="fa fa-tv"></i>
                      ${text}
                  </a>`;
      }
      return `<a href=${href}>${text}</a>`;
    };

  }

  ngOnInit() {
    this.id = this.route.snapshot.params.challengeId;
    this.watchProblem();
    //TODO: leverage signalr events instead of this interval
    this.subs.push(interval(1000).subscribe(_ => this.updateState()));

    this.subs.push(this.notificationSvc.teamUpdates$.subscribe((team) => {
      this.logger.log('team updated:', team);
      this.profile.team = team;
      this.loadChallengeProblem();
    }));

    this.subs.push(this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        this.logger.log('user updated:', profile);
        if (!!profile) {
          this.profile = profile;
        }
        this.logger.log('user updated: reload challenge');

        this.loadChallengeProblem();
      }, err => this.main.error(err)
    ));
  }

  loadChallengeProblem() {
    this.logger.log('loadChallengeProblem:');
    this.logger.log('loading:', this.loading);

    if (!this.profile || this.loading)
      return;

    this.logger.log('teamId:', this.profile.user.teamId);

    this.loading = true;

    this.load$ = this.challengeService.load(this.id, this.profile.user.teamId).subscribe(result => {
      this.logger.log('challenge loaded:', result);
      this.challengeProblem = result;
      this.challengeProblem.state = {};
      this.initTokens();
      this.initTestFlagIndices();

      this.teamBoard = this.profile.team.teamBoards.find(t => t.board.id === result.board.id);
      this.updateState();
    },
      error => this.main.error(error),
      () => {
        this.load$.unsubscribe();
        this.loading = false;
      }
    );
  }

  initTestFlagIndices() {
    this.logger.log('initTestFlagIndices:', this.isTestMode);

    if (this.isTestMode &&
      this.flagIndices == null &&
      this.challengeProblem.challenge.flagCount &&
      this.challengeProblem.challenge.flagCount > 1) {

      this.showFlagIndexSelect = true;

      const flagIndices: number[] = [];

      for (let i = 0; i < this.challengeProblem.challenge.flagCount; i++) {
        flagIndices.push(i);
      }

      this.flagIndices = flagIndices;
    }
  }

  initTokens() {
    this.logger.log('initTokens:', this.challengeProblem.problem);
    if (this.challengeProblem.problem) {
      this.tokens = this.challengeProblem.problem.tokens;
    }
  }

  isDisabled(token: TokenDetail, index: number): boolean {
    if (this.challengeProblem.challenge.isMultiStage) {
      if (token.status == 'Correct')
        return true;

      let next: number = 0;

      this.challengeProblem.problem.tokens.forEach(x => {
        if (x.status == 'Correct') {
          next = x.index + 1;
        }
      });

      return next != index;
    }

    return token.status == 'Correct'
  }

  isVisible(token: TokenDetail, index: number): boolean {
    if (!this.challengeProblem.challenge.isMultiStage) {
      return true;
    }
    else {
      if (token.status === 'Correct') {
        return true;
      }

      let next: number = 0;

      this.challengeProblem.problem.tokens.forEach(x => {
        if (x.status == 'Correct') {
          next = x.index + 1;
        }
      });

      if (next !== index) {
        return false;
      }
      else {
        return true;
      }
    }
  }

  getStatusClass(s: SubmissionDetail, index: number): string {
    let cl = '';

    let status = this.getStatusText(s, index);

    switch (status) {
      case 'Submitted':
        cl = 'badge-primary';
        break;
      case 'Passed':
        cl = 'badge-success';
        break;
      case 'Partial':
        cl = 'badge-warning';
        break;
      case 'Failed':
        cl = 'badge-danger';
        break;
    }

    return cl;
  }

  getStatusText(s: SubmissionDetail, index: number): string {
    let status = s.status;

    if (this.challengeProblem.challenge.isMultiStage) {
      if (status != 'Submitted' && status != 'Passed') {
        status = 'Partial';
        s.tokens.forEach(t => {
          if (t.status == TokenStatusType.Incorrect) {
            status = 'Failed';
          }
        });
      }
    }

    if (this.challengeProblem.challenge.isMultiPart) {
      if (status != 'Submitted' && status != 'Passed') {
        s.tokens.forEach((t, i) => {
          if (t.status == TokenStatusType.Correct) {
            const submissions = this.challengeProblem.problem.submissions;

            const previous = index > 0 ? submissions[index - 1] : null;

            if (!!previous) {

              if (previous.tokens.length - 1 > i) {
                const pt = previous.tokens[i];

                if (pt.status != TokenStatusType.Correct) {
                  status = 'Partial';
                }
              }
            }
            else {
              status = 'Partial';
            }            
          }
        });
      }
    }

    return status;
  }

  watchProblem() {
    this.subs.push(this.notificationSvc.problem$.subscribe(
      (problem: ProblemDetail) => {

        if (!this.challengeProblem) { return; }

        if ((this.challengeProblem.problem && this.challengeProblem.problem.id === problem.id)
          || (this.challengeProblem.challenge && this.challengeProblem.challenge.id === problem.challengeLinkId)) {

          this.challengeProblem.problem = problem;

          if (!!this.etacountdown$) { this.etacountdown$.unsubscribe(); }

          this.eta = this.challengeProblem.problem.estimatedReadySeconds;
          this.etacountdown$ = interval(1000).pipe(take(this.eta)).subscribe(() => this.eta -= 1);
        }
      }, error => this.main.error(error)
    ));
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

        if (!!this.challengeProblem.problem &&
          (this.challengeProblem.problem.status === 'Registered' || !this.challengeProblem.problem.status)) {
          const now = new Date();
          const start: Date = this.formatDate(this.challengeProblem.problem.start);
          const minutes = (now.getTime() - start.getTime()) / 60000;

          if (minutes >= this.resetMinutes) {
            this.isRestartAllowed = true;
          }
        }
        else {
          this.isRestartAllowed = false;
        }
      }

      this.challengeService.updateState(this.challengeProblem);
    }

    this.updatingState = false;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-dialog-centered modal-lg', animated: true, backdrop: 'static' });
  }

  reset() {
    this.modalRef.hide();

    this.initializing = true;

    this.challengeService.reset(this.challengeProblem.challenge.id)
      .subscribe(
        () => window.location.reload(),
        error => this.main.error(error)
      );
  }

  restart() {
    this.modalRef.hide();

    this.initializing = true;

    this.challengeService.restart(this.challengeProblem.challenge.id)
      .subscribe(
        () => window.location.reload(),
        error => this.main.error(error)
      );
  }

  start() {
    this.modalRef.hide();

    this.challengeProblem.state.isPending = true;
    this.challengeProblem.state.isError = false;

    this.initializing = true;
    this.challengeService.startChallenge(this.challengeProblem.challenge.id, this.flagIndex)
      .pipe(finalize(() => this.initializing = false))
      .subscribe(() => { },
        error => {
          this.challengeProblem.state.isPending = false;
          this.main.error(error);
        }
      );
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  submit() {
    this.modalRef.hide();

    if (!this.tokens || this.tokens.length == 0)
      return;

    let submit: boolean = false;

    this.tokens.forEach(t => {
      if (t.value && t.value.trim().length > 0) submit = true;
    });

    if (submit) {
      this.challengeProblem.state.grading = true;

      const model: SubmissionCreate = {
        problemId: this.challengeProblem.problem.id,
        tokens: this.tokens.map(t => t.value)
      };

      this.challengeService.submitChallenge(model).subscribe(
        () => {
          this.initTokens();
        },
        error => this.main.error(error),
        () => {
          this.challengeProblem.state.grading = false;
        }
      );
    }
  }

  deleteGamespace() {
    this.modalRef.hide();

    this.challengeProblem.state.isPending = true;
    this.challengeProblem.problem.gamespaceReady = false;
    this.challengeService.deleteGamespace(this.challengeProblem.problem.id).subscribe(
      () => {
        this.challengeProblem.state.isPending = false;
      },
      (error) => this.main.error(error)
    );
  }

  restartGamespace() {
    this.modalRef.hide();

    this.challengeProblem.state.restarting = true;
    this.challengeService.restartGamespace(this.challengeProblem.problem.id).subscribe(
      () => { },
      (error) => this.main.error(error)
    );
  }

  trackSubmissions(submission: SubmissionDetail) {
    return (!!submission) ? submission.id : null;
  }

  printChallenegeInstructions() {
    window.open('challenge-print/' + this.id, '_blank');
  }
}

