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

import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { interval } from 'rxjs';
import { BoardDetail, DataFilter, Leaderboard, LeaderboardScore, OrganizationDetail, TeamBadgeUpdate } from '../../models';
import { BoardService } from '../../svc/board.service';
import { LeaderboardService } from '../../svc/leaderboard.service';
import { MessageService } from '../../svc/message.service';
import { NotificationService } from '../../svc/notification.service';
import { BadgeItem, SettingsService } from '../../svc/settings.service';
import { TeamService } from '../../svc/team.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { GameService } from '../../svc/game.service';
import { CounterPipe } from '../../pipes/counter.pipe';
import { CursorError } from '@angular/compiler/src/ml_parser/lexer';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('badgeModal', { static: false }) badgeModal: ModalDirective;

  board: BoardDetail;
  boards: BoardDetail[] = [];
  badges: BadgeItem[] = [];
  orgs: Array<OrganizationDetail> = [];
  leaderboard: Leaderboard;
  id: string;
  dataFilter: DataFilter = { sort: 'rank', take: 25, skip: 0 };
  selectedOrg = '';
  isModerator = false;
  isObserver = false;
  more: boolean;
  selected: LeaderboardScore[] = [];
  teamBadgeUpdates: TeamBadgeUpdate[] = [];
  heading = '';
  activeCount = 0;

  constructor(
    private main: HomeComponent,
    private leaderboardSvc: LeaderboardService,
    private teamService: TeamService,
    private notifier: NotificationService,
    private service: BoardService,
    private gameService: GameService,
    private router: Router,
    msgSvc: MessageService,
    private userSvc: UserService,
    private route: ActivatedRoute,
    private config: SettingsService,
    private analogCounter: CounterPipe
  ) {
    super();
  }

  ngOnInit() {
    this.subs.push(this.teamService.getOrganizations().subscribe(data => this.orgs = data));

    this.subs.push(this.gameService.getDefault().subscribe(
      game => {
        this.heading = game.isMultiplayer ? 'Team' : 'Player';
      }, e => this.main.error(e)
    ));

    this.route.params.subscribe((params) => {      
      this.id = params.id;
      if (this.id === undefined) {
        this.id = '';
      }
      this.load();
    });

    this.loadBoards();
    this.loadProfile();
    this.startIntervals();
  }

  startIntervals() {
    this.subs.push(
      interval(120000).subscribe(() => this.load()),

      interval(1000).subscribe(() => {
        if (this.board && this.leaderboard && this.leaderboard.results) {

          this.leaderboard.results.forEach(s => {

            let isActive = false;
            if (s.start) {
              const end = new Date(s.start).valueOf() + (s.maxMinutes * 60000);
              isActive = end > Date.now();
              s.timer = this.analogCounter.transform(end, 'analog');
            }

            s.isActive = isActive;
          });
        }
      })
    );
  }

  loadProfile() {
    this.userSvc.user$.subscribe(
      profile => {
        this.isModerator = profile && profile.user.isModerator;
        this.isObserver = profile && profile.user.isObserver;
      }, err => this.main.error(err));
  }

  onTeamChange(score: LeaderboardScore, event) {
    if (event.target.checked) {
      this.selected.push(score);
    } else {
      for (let i = 0; i < this.selected.length; i++) {
        if (this.selected[i].id === score.id) {
          this.selected.splice(i, 1);
        }
      }
    }
  }

  onAllTeamChange(event) {
    this.leaderboard.results.forEach(score => this.onTeamChange(score, event));
  }

  onBoardChanged() {
    this.router.navigate(['/board', this.id, 'scores']);
  }

  export() {
    this.leaderboardSvc.export(this.id);
  }

  load() {
    if (this.id) {
      this.selected = [];
      this.subs.push(this.leaderboardSvc.load(this.id, this.dataFilter)
        .subscribe((result) => {
          this.leaderboard = result;

          this.badges = [];
          const currentBoard = this.boards.find(b => b.id === this.id);
          if (currentBoard) {
            const availableBadges = currentBoard.badges.split(" ");
            this.config.settings.badge.items.forEach(b => {
              if (availableBadges.indexOf(b.key) !== -1) {
                this.badges.push(b);
              }
            });
          }

        }, (err) => this.main.error(err))
      );
    }
  }

  openAwardBadge(): void {
    this.teamBadgeUpdates = [];

    const ordered: LeaderboardScore[] = this.selected.sort((a, b) => a.rank < b.rank ? -1 : 1);

    ordered.forEach(v => {

      const badges: string[] = [];

      v.badges.forEach(b => {
        badges.push(b);
      });

      this.teamBadgeUpdates.push({
        badges,
        id: v.id,
        name: v.name,
        rank: v.rank,
        score: v.score,
        organizationLogoUrl: v.organizationLogoUrl
      });
    });

    this.badgeModal.show();
  }

  hasBadge(score: TeamBadgeUpdate, badge: string): boolean {
    if (score.badges) {
      return score.badges.indexOf(badge) !== -1;
    }

    return false;
  }

  addAll(badge: string) {
    this.teamBadgeUpdates.forEach(v => {
      if (!v.badges) { v.badges = []; }

      if (v.badges.indexOf(badge) === -1) {
        v.badges.push(badge);
      }
    });
  }

  toggleBadge(score: TeamBadgeUpdate, badge: string): void {
    if (!score.badges) { score.badges = []; }

    const index = score.badges.indexOf(badge);

    if (index === -1) { score.badges.push(badge); } else { score.badges.splice(index, 1); }

    return;
  }

  updateBadges() {
    const keys = this.badges.map(b => b.key);

    this.teamBadgeUpdates.forEach(tbu => {
      tbu.badges = tbu.badges.sort((a, b) => keys.indexOf(a) - keys.indexOf(b));
    });

    this.teamService.updateBadges(this.teamBadgeUpdates).subscribe(
      data => {
        this.selected = [];
        this.main.success('Badges Updated.');
        this.refresh();
        this.badgeModal.hide();
      },
      err => {
        this.selected = [];
        this.main.error(err);
        this.badgeModal.hide();
      }
    );
  }

  refresh() {
    this.subs.push(this.leaderboardSvc.refresh().subscribe(data => { }));
  }

  loadBoards() {
    this.subs.push(
      this.service.list().subscribe(
        data => {
          this.boards = data;
          if (!this.id) {
            this.id = this.service.default().id;
            this.load();
          }

          this.board = this.boards.find(b => b.id == this.id);
          this.config.boardChanged(this.board);
        },
        err => this.main.error(err)
      )
    );
  }

  filterByOrg() {
    this.dataFilter.filter = '';

    if (this.selectedOrg) {
      this.dataFilter.filter = 'organization=' + this.selectedOrg;
    }

    this.dataFilter.skip = 0;
    this.dataFilter.take = 25;
    this.load();
  }

  trackTeamId(i: number, score: LeaderboardScore) {
    return (!!score) ? score.id : null;
  }

  pageForward() {
    this.dataFilter.skip += this.dataFilter.take;
    this.load();
  }

  pageBack() {
    this.dataFilter.skip -= this.dataFilter.take;
    this.load();
  }

  showBack() {
    if (this.dataFilter.skip !== 0) {
      return true;
    } else {
      return false;
    }
  }

  showForward() {
    if ((this.dataFilter.skip + this.dataFilter.take) < this.leaderboard.total) {
      return true;
    } else {
      return false;
    }
  }
}

