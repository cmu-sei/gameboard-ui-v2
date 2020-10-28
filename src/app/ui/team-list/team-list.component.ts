// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { interval, Observable } from 'rxjs';
import { BoardDetail, DataFilter, MessageCreate, TeamBoardDetail, TeamDetail, TeamUpdate, UserProfile, UserSummary, PagedResult, OrganizationDetail, TeamBoardUpdate } from '../../models';
import { BoardService } from '../../svc/board.service';
import { TeamService } from '../../svc/team.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { SettingsService, BadgeItem } from '../../svc/settings.service';

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent extends BaseComponent implements OnInit {
  @ViewChild('startModal', { static: false }) startModal: ModalDirective;
  @ViewChild('overrideModal', { static: false }) overrideModal: ModalDirective;
  @ViewChild('systemMessageModal', { static: false }) systemMessageModal: ModalDirective;
  @ViewChild('messageModal', { static: false }) messageModal: ModalDirective;
  @ViewChild('confirmModal', { static: false }) confirmModal: ModalDirective;

  profile: UserProfile;
  isModerator = false;
  isObserver = false;
  teams: PagedResult<TeamDetail>;
  startBoardModal: BsModalRef;
  errorMsg = '';
  saved = false;
  overrideSaved = false;
  model: TeamUpdate = {};
  dataFilter: DataFilter = { sort: '-start', filter: '', skip: 0, take: 50, term: '' };
  teamBoards: TeamBoardDetail[];
  gameboards: BoardDetail[];
  currentTeamBoard: TeamBoardDetail;
  systemMessageSent = false;
  systemMessage = '';
  message: MessageCreate;
  selected: TeamDetail[] = [];
  to: string[] = [];
  messageMode: string;
  autorefresh = true;
  badgeItems: BadgeItem[];

  organizations: Array<OrganizationDetail>;
  organization: string = '';

  boards: Array<BoardDetail>;
  board: string = '';

  badges: string[] = [];
  filterBadges: string[] = [];

  isTestMode: boolean = false;

  confirm: Confirm;
  pending: boolean = false;

  constructor(
    private main: HomeComponent,
    private teamSvc: TeamService,
    private boardSvc: BoardService,
    private userSvc: UserService,
    private gameboardSvc: BoardService,
    private config: SettingsService,
    private router: Router
  ) {
    super();
    this.badgeItems = config.settings.badge.items;
    this.isTestMode = config.settings.environment.mode === 'Test';
  }

  ngOnInit() {

    this.initDataFilter();

    this.badgeItems.forEach(b => this.badges.push(b.key));
    this.subs.push(this.teamSvc.getOrganizations().subscribe(data => this.organizations = data));
    this.loadBoards();

    this.subs.push(

      interval(1000).subscribe(() => {
        if (this.teams && this.gameboards) {

          // flatMap not available in es2015
          this.teams.results.forEach(t => t.teamBoards.forEach((tb: TeamBoardDetail) => {
            this.gameboardSvc.updateTeamBoardState(tb);
          }));
        }
      }),

      interval(120000).subscribe(() => {
        if (this.autorefresh) {
          this.search();
        }
      })
    );

    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.profile = profile;
        this.isModerator = profile && profile.user.isModerator;
        this.isObserver = profile && profile.user.isObserver;

        if (!this.isModerator && !this.isObserver) {
          this.router.navigate(['/']);
        }
      }, err => this.main.error(err))
    );

    this.search();
    this.loadGameboards();
  }

  initDataFilter() {
    let dataFilter = this.getStorageItem<DataFilter>('team-list');

    if (!!dataFilter) {
      this.dataFilter = dataFilter;
    }
        
    if (!!this.dataFilter.filter) {
      let pairs = this.dataFilter.filter.split('|');

      pairs.forEach(p => {
        let kv = p.split('=');

        if (kv.length == 2) {
          let key = kv[0];
          let value = kv[1];

          if (key === 'organization') {
            this.organization = value;
          }
          if (key === 'board') {
            this.board = value;
          }
          if (key === 'badge') {
            let values = value.split(',');

            values.forEach(v => {
              this.filterBadges.push(v);
            });
          }
        }
      })
    }
  }

  loadBoards() {
    this.subs.push(
      this.gameboardSvc.list().subscribe(
        data => this.boards = data,
        err => this.main.error(err)
      )
    );
  }

  toggleAutoRefresh() {
    this.autorefresh = !this.autorefresh;
    this.onSortChanged();
  }

  onSortChanged() {
    sessionStorage.setItem('teamSort', this.dataFilter.sort);
    if (sessionStorage.hasOwnProperty('teamSort')) {
      this.dataFilter.sort = sessionStorage.getItem('teamSort');
    }
    this.selected = [];
    this.search();
  }

  onFilterBadgeSelect(b: string) {
    let index: number = this.filterBadges.indexOf(b);

    if (index == -1) this.filterBadges.push(b);
    else this.filterBadges.splice(index);

    this.selected = [];
    this.search();
  }

  getFilters() : string {
    let filter: Array<string> = [];

    if (this.filterBadges.length > 0) {
      filter.push('badge=' + (this.filterBadges.join(',')));
    }

    if (this.organization) {
      filter.push('organization=' + this.organization);
    }

    if (this.board) {
      filter.push('board=' + this.board);
    }

    return filter.join('|');
  }

  reset() {
    this.selected = [];
    this.search();
  }

  search() {
    this.dataFilter.filter = this.getFilters();
    this.subs.push(
      this.teamSvc.loadAll(this.dataFilter).subscribe(result => {
        this.setStorageItem('team-list', this.dataFilter);
        this.teams = result;
      })
    );
  }

  export() { this.teamSvc.export(); }

  exportTeamActivity() { this.teamSvc.exportTeamActivity(); }

  loadGameboards() {
    this.subs.push(
      this.gameboardSvc.loadAll().subscribe(result => this.gameboards = result)
    );
  }

  edit(id: string): void {
    this.saved = false;
    this.subs.push(this.teamSvc.load(id).subscribe(
      (result) => {
        this.model.id = result.id;
        this.model.name = result.name;
        this.model.organizationName = result.organizationName;
        this.model.organizationLogoUrl = result.organizationLogoUrl;
        this.model.organizationalUnitLogoUrl = result.organizationUnitLogoUrl;
      })
    );
    this.startModal.show();
  }

  save() {
    this.subs.push(this.teamSvc.update(this.model.id, this.model as TeamUpdate).subscribe(
      () => {
        this.saved = true;
        this.teams.results.find(t => t.id === this.model.id).name = this.model.name;
      },
      err => this.main.error(err)
    ));
  }

  openUserMessage(user: UserSummary) {
    this.messageMode = 'User';
    this.to = [user.name];
    this.message = { to: [user.id] };
    this.messageModal.show();
  }

  openTeamMessage() {
    this.messageMode = 'Team';
    this.to = [];
    this.selected.forEach(t => {
      this.to.push(t.name);
    });

    this.message = { };
    this.messageModal.show();
  }

  disable() {
    const ids: string[] = [];
    this.selected.forEach(t => { ids.push(t.id); });

    if (ids.length > 0) {
      this.teamSvc.disable(ids).subscribe(() => {
        this.main.warning(ids.length + ' team(s) disabled.');
        this.reset();
      }, err => this.main.error(err));
    }
  }

  enable() {
    const ids: string[] = [];
    this.selected.forEach(t => { ids.push(t.id); });

    if (ids.length > 0) {
      this.teamSvc.enable(ids).subscribe(() => {
        this.main.success(ids.length + ' team(s) enabled.');
        this.reset();
      }, err => this.main.error(err));
    }
  }

  sendMessage() {
    if (this.messageMode === 'Team') { this.sendTeamMessage(); } else { this.sendUserMessage(); }
  }

  sendUserMessage() {
    if (this.message.subject && this.message.subject.length > 0 && this.message.body && this.message.body.length > 0) {
      this.message.body = this.message.body
          .replace(/{name}/g, this.to.pop());

      this.userSvc.sendMessage(this.message).subscribe(() => { this.message.success = 'Message was sent.'; },
        err => { this.message.error = err.error ? err.error.message : err.message; }
      );
    } else {
      this.message.error = 'Subject and Body are required to send a message.';
    }
  }

  sendTeamMessage() {
    if (this.message.subject && this.message.subject.length > 0 && this.message.body && this.message.body.length > 0) {

      let success = 0;
      let fail = 0;

      this.selected.forEach(t => {
        const message: MessageCreate = { body: this.message.body, subject: this.message.subject };
        message.body = message.body
          .replace(/{name}/g, t.name)
          .replace(/{org}/g, t.organizationName);

        const ids: string[] = [];
        t.members.forEach(u => { ids.push(u.id); });

        message.to = ids;

        this.userSvc.sendMessage(message).subscribe(() => {
          success++;

          if (success + fail === this.selected.length) {
            this.main.success(success + ' messages sent.');
            this.selected = [];
            this.messageModal.hide();
          }
        },
          err => {
            fail++;
            if (success + fail === this.selected.length) {
              this.selected = [];
              this.messageModal.hide();
            }
            this.main.error(err);
          }
        );
      });
    } else {
      this.message.error = 'Subject and Body are required to send a message.';
    }
  }

  overrideTime(tb: TeamBoardDetail): void {
    this.overrideSaved = false;
    this.currentTeamBoard = {
      teamId: tb.teamId,
      board: tb.board,
      overrideMaxMinutes: tb.overrideMaxMinutes
    };    

    this.overrideModal.show();
  }

  overrideMaxMinutes() {
    const model: TeamBoardUpdate = {
      teamId: this.currentTeamBoard.teamId,
      boardId: this.currentTeamBoard.board.id,
      overrideMaxMinutes: this.currentTeamBoard.overrideMaxMinutes
    };

    this.teamSvc.overrideMaxMinutes(model).subscribe(
      () => {
        this.overrideSaved = true;
        let team = this.teams.results.find(t => t.id === this.currentTeamBoard.teamId);
        let teamBoard = team.teamBoards.find(tb => tb.board.id === this.currentTeamBoard.board.id);

        teamBoard.overrideMaxMinutes = this.currentTeamBoard.overrideMaxMinutes;
      },
      err => this.main.error(err)
    );
  }

  showSystemMessageDialog() {
    this.systemMessageSent = false;
    this.systemMessageModal.show();
  }

  resetTeamBoard(tb: TeamBoardDetail): void {
    this.confirm = {
      type: 'reset-board',
      value: tb,
      title: 'Reset ' + tb.board.name,
      message: 'Are you sure you want to reset this board for ' + tb.teamName + '? This cannot be undone.'
    };

    this.confirmModal.show();
  }

  resetTeam(team: TeamDetail): void {
    this.confirm = {
      type: 'reset-team',
      value: team,
      title: 'Reset ' + team.name,
      message: 'Are you sure you want to reset ' + team.name + '? This cannot be undone.'
    };

    this.confirmModal.show();
  }

  hideConfirm(): void {
    this.confirm = null;
    this.confirmModal.hide();
  }

  onConfirm(): void {

    let request: Observable<TeamDetail> = null;
    let message: string = '';

    switch (this.confirm.type) {
      case 'reset-board':
        const resetBoard = this.confirm.value as TeamBoardDetail;
        request = this.boardSvc.resetTeamBoard(resetBoard.board.id, resetBoard.teamId);
        message = 'Board reset';
        break;     
      case 'reset-team':
        const resetTeam = this.confirm.value as TeamDetail;
        request = this.teamSvc.reset(resetTeam.id);
        message = 'Team reset';
        break;
    }

    if (!!request) {
      if (!this.pending) {
        this.pending = true;
        this.subs.push(request.subscribe(
          (result) => {
            this.main.success(message + ' was successful.');
            this.reset();
          },
          err => {
            this.pending = false;
            this.confirm = null;
            this.confirmModal.hide();

            this.main.error(err);            
          },
          () => {
            this.pending = false;
            this.confirm = null;
            this.confirmModal.hide();
          }));
      }
    }
    else {
      this.confirm = null;
      this.confirmModal.hide();
    }    
  }

  sendSystemMessage() {
    if (this.systemMessage && this.systemMessage.length > 0) {
      this.teamSvc.sendSystemMessage(this.systemMessage).subscribe(
        (result) => {
          if (result) {
            this.systemMessageSent = true;
            this.systemMessage = '';
          }
        },
        err => this.main.error(err)
      );
    } else {
      this.main.warning('Message cannot be empty.');
    }
  }

  onTeamChange(team: TeamDetail, event) {
    if (event.target.checked) {
      this.selected.push(team);
    } else {
      for (let i = 0; i < this.selected.length; i++) {
        if (this.selected[i].id === team.id) {
          this.selected.splice(i, 1);
        }
      }
    }
  }

  onAllTeamChange(event) {
    this.teams.results.forEach(t => this.onTeamChange(t, event));
  }

  trackTeamId(team: TeamDetail) {
    return (!!team) ? team.id : null;
  }
}

class Confirm
{
  type?: string;
  value?: TeamDetail | TeamBoardDetail;
  title?: string;
  message?: string;
}

