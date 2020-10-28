/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ActionType, BoardDetail, BoardType, ChallengeLinkDetail, CoordinateDetail, MapDetail, ProblemDetail, QuestionDetail, TeamBoardDetail, TeamBoardStatus, TeamDetail, UserProfile } from '../../models';
import { BoardService } from '../../svc/board.service';
import { GameService } from '../../svc/game.service';
import { LoggerService } from '../../svc/logger.service';
import { NotificationService } from '../../svc/notification.service';
import { SettingsService } from '../../svc/settings.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { Session } from 'inspector';

@Component({
  selector: 'app-gameboard',
  templateUrl: './gameboard.component.html',
  styleUrls: ['./gameboard.component.scss']
})
export class GameboardComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('videoModal', { static: false }) videoModal: ModalDirective;
  @ViewChild('startModal', { static: false }) startModal: ModalDirective;
  @ViewChild('resetModal', { static: false }) resetModal: ModalDirective;

  board: BoardDetail;
  teamBoard: TeamBoardDetail;
  timer?: string;
  status: TeamBoardStatus;
  showNav: boolean;
  currentActiveBoardId: string;
  profile: UserProfile;  
  multiplayer: boolean;
  initiateTeamBoardCreate: boolean;  
  isTestMode: boolean = false;
  resetting: boolean = false;
  mapVideoUrl: string;
  map: MapDetail;
  sessionEnd: Date;

  constructor(
    private main: HomeComponent,
    private location: Location,
    private boardService: BoardService,
    private notificationSvc: NotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private userSvc: UserService,
    private config: SettingsService,
    private gameService: GameService,
    private modalService: BsModalService,
    private logger: LoggerService
  ) {
    super();

    this.isTestMode = config.settings.environment.mode === 'Test';
  }

  initProfile(profile: UserProfile) {
    if (!!profile) {
      this.profile = profile;

      if (!!this.profile.team) {
        this.logger.log('isTeamOwner', profile.team, profile.user.id);        
      }
      else {
        this.logger.log('team is null');
      }
    }
  }

  ngOnInit() {
    this.subs.push(this.gameService.getDefault().subscribe(
      game => {
        this.multiplayer = game.maxTeamSize > 1;
      }, e => this.main.error(e)
    ));

    this.initProfile(this.userSvc.profile);

    this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        this.initProfile(profile);
      }, err => this.main.error(err)
    ),

    this.loadBoard();

    this.subs.push(
      interval(1000).subscribe(_ => this.getStatus()),

      this.userSvc.user$.subscribe(
        (profile: UserProfile) => {
          this.initProfile(profile);
        }, err => this.main.error(err)
      ),

      this.notificationSvc.teamUpdates$.subscribe(
        (team: TeamDetail) => {
          this.teamBoard = null;
        }
      ),

      this.notificationSvc.problem$.subscribe(
        (problem: ProblemDetail) => {
          if (!!this.board) {
            if (this.board.boardType == BoardType.Trivia) {
              this.board.categories.forEach((c) => {
                const challengeModel = c.questions.find(o => o.challenge.id === problem.challengeLinkId);
                if (!!challengeModel) {
                  challengeModel.challenge.problemStatus = problem.status;
                  challengeModel.challenge.problemId = problem.id;
                }
              });
            }

            if (this.board.boardType == BoardType.Map) {
              this.board.maps.forEach((c) => {
                const challengeModel = c.coordinates.find(o => o.challenge.id === problem.challengeLinkId);
                if (!!challengeModel) {
                  challengeModel.challenge.problemStatus = problem.status;
                  challengeModel.challenge.problemId = problem.id;
                }
              });
            }
          }
        }, err => this.main.error(err)
      )
    );
  }

  initSessionEnd() {
    let sessionEnd = new Date(Date.now() + (this.board.maxMinutes * 60000));
    let stopTime = this.formatDate(this.board.stopTime);

    if (!!stopTime && stopTime.valueOf() < sessionEnd.valueOf()) {
      sessionEnd = stopTime;
    }

    this.sessionEnd = sessionEnd;
  }

  userHasRequiredBadges() {
    if (!this.board || !this.profile) {
      return false;
    }

    if (this.board.requiredBadges) {
      if (this.profile.team.badges) {
        const requiredBadges = this.board.requiredBadges.split(' ');

        for (let i = 0; i < requiredBadges.length; i++) {
          if (this.profile.team.badges.indexOf(requiredBadges[i]) === -1) {
            return false;
          }
        }

        return true;
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }
  }

  loadBoard() {
    this.subs.push(this.route.params.pipe(switchMap((params: Params) => this.boardService.load(params.id)))
      .subscribe(result => {
        this.board = result;
        this.board.isStartAllowed = this.userHasRequiredBadges();

        this.config.boardChanged(this.board);

        if (this.board.boardType === BoardType.Map) {
          let map: MapDetail = this.getMap(this.config.lastMapId);

          if (!!map) {
            this.map = map;
          }
          else {
            this.main.error('Board does not contain any maps.');
          }
        }
        this.initiateTeamBoardCreate = false;
        this.teamBoard = null;
      }, err => this.main.error(err)
      )
    );
  }

  downloadCertificate() {
    this.boardService.downloadCertificate(this.board.id);
  }

  getMap(id?: string): MapDetail {
    let map: MapDetail;
    if (this.board.maps.length > 0) {

      if (!!id) {
        map = this.board.maps.find(m => m.id === id);
      }

      if (!map) {
        map = this.board.maps.find(m => m.order === 0);
      }

      if (!map) {
        map = this.board.maps[0]
      }
    }

    return map;
  }

  getStatus() {
    if (!this.profile || !this.board) { return; }

    this.boardService.updateBoardState(this.board);

    this.logger.log('board', this.board);

    if (!this.teamBoard) {
      this.logger.log('teamBoards', this.profile.team.teamBoards);
      this.teamBoard = this.profile.team && this.profile.team.teamBoards.find(o => o.board.id === this.board.id);
    }

    if (!!this.teamBoard) {
      this.boardService.updateTeamBoardState(this.teamBoard);
      if (this.startModal.isShown) { this.startModal.hide(); }
      return;
    }

    if (this.board.state.active && !this.teamBoard && !this.initiateTeamBoardCreate) {
      this.initiateTeamBoardCreate = true;
      if (this.board.maxMinutes) {
        this.subs.push(this.boardService.status(this.board.id).subscribe(result => {
          this.status = result;
          this.displayStartBoard();
        }, err => this.main.error(err)));
      } else {
        this.startBoard();
      }
    }
  }

  startBoard() {
    this.startModal.hide();
    let teamBoard: TeamBoardDetail;
    this.boardService.start(this.board.id).subscribe(result => {      
      this.loadBoard();
      teamBoard = result;
      if (this.status) {
        this.status.teamBoard = teamBoard;
      } else {
        this.boardService.status(this.board.id).subscribe(status => {
          this.status = status;
          this.status.teamBoard = teamBoard;
        }, err => this.main.error(err));
      }
    }, err => this.main.error(err));
  }

  displayStartBoard(): void {
    this.initSessionEnd();

    this.subs.push(interval(60000).subscribe(_ => {
      this.initSessionEnd();
    }));

    this.startModal.show();
  }

  toFullscreen() {
    this.router.navigate(['/board', this.board.id]);
  }

  onMapClick(coordinate: CoordinateDetail) {

    if (coordinate.isDisabled) {
      this.showDisabled(coordinate);
    }
    else {
      switch (coordinate.actionType) {
        case ActionType.Video:
          this.videoStart(coordinate.actionValue);
          break;
        case ActionType.Challenge:
          this.openChallenge(coordinate.challengeLink);
          break;
        case ActionType.Map:
          this.map = this.getMap(coordinate.actionValue);

          if (!!this.map) {
            this.config.lastMapId = this.map.id;
          }

          break;
        default:
          break;
      }
    }
  }

  showDisabled(container: QuestionDetail | CoordinateDetail): void {

    if (!!container.challenge) {
      this.main.warning(container.challenge.title + ' is currently unavailable.', container.challenge.id);
    }
    else {
      this.main.warning('This is currently unavailable.', container.id);
    }

  }
  
  onTriviaClick(question: QuestionDetail) {
    if (question.isDisabled) {
      this.showDisabled(question);
    }
    else {
      this.openChallenge(question.challengeLink);
    }
  }

  openChallenge(challengeLink: ChallengeLinkDetail) {
    if (!this.profile) {
      this.main.warning('Please login to use the gameboard.', 'auth');
      return;
    }

    this.router.navigate(['/board', this.board.id, 'challenge', challengeLink.id]);
  }

  videoStart(url: string) {
    this.mapVideoUrl = url;
    this.videoModal.show();
  }

  videoStop() {
    this.mapVideoUrl = '';
    this.videoModal.hide();
  }

  displayResetBoard(): void {    
    this.resetModal.show();
  }

  resetGameboard() {
    this.resetting = true;
    this.resetModal.hide();
    this.subs.push(
      this.boardService.reset(this.board.id).subscribe(
        () => window.location.reload(),
        err => this.main.error(err),
        () => this.resetting = false)
    );
  }
}

