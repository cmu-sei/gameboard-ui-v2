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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs'; // since RxJs 6
import { DataFilter, OrganizationDetail, PagedResult, TeamActivity, TeamBadgeUpdate, TeamBoardDetail, TeamBoardEventDetail, TeamCreate, TeamDetail, TeamInviteCode, TeamSummary, TeamUpdate, TeamBoardUpdate, BoardTimes, ProblemEventDetail } from '../models';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class TeamService {
  url: string;
  exporting = false;

  constructor(
    private http: HttpClient,
    private settingsSvc: SettingsService,
    private router: Router,
    private auth: AuthService
  ) {
    this.url = settingsSvc.settings.coreUrl;
    if (!this.url.endsWith('/api')) {
      this.url += '/api';
    }
  }

  load(id: string): Observable<TeamDetail> {
    return this.http.get<TeamDetail>(this.url + '/team/' + id);
  }

  public reset(id: string): Observable<TeamDetail> {
    return this.http.post<TeamDetail>(this.url + '/team/' + id + '/reset', null);
  }

  loadTeamActivities(search: DataFilter): Observable<PagedResult<TeamActivity>> {
    return this.http.get<PagedResult<TeamActivity>>(this.url + '/teams/activity/' +
      this.auth.queryStringify(search, '?'));
  }

  loadTeamBoard(id: string): Observable<TeamBoardDetail> {
    return this.http.get<TeamBoardDetail>(this.url + '/teamboard/' + id);
  }

  loadTeamBoardEvents(id: string): Observable<Array<TeamBoardEventDetail>> {
    return this.http.get<Array<TeamBoardEventDetail>>(this.url + '/teamboard/' + id + '/events');
  }

  loadAll(search: DataFilter): Observable<PagedResult<TeamDetail>> {
    return this.http.get<PagedResult<TeamDetail>>(this.url + '/teams/' +
      this.auth.queryStringify(search, '?'));
  }

  formatDate(value: any): Date | undefined {
    if (value)
      return new Date(value.toString());

    return null;
  }

  generateTeamBoardEvents(boards: TeamBoardEventDetail[], boardTimes: BoardTimes[]): TeamBoardEventDetail[] {
    boards.forEach(b => {

      const temp = boardTimes.find(x => x.name === b.board.name);
      if (temp == null) {
        const bt = new BoardTimes();
        bt.name = b.board.name;
        bt.start = b.start;
        bt.end = new Date(new Date(bt.start).valueOf() + (Math.max(b.board.maxMinutes, b.overrideMaxMinutes) * 60000));
        boardTimes.push(bt);
      }

      b.challenges.forEach(c => c.events.forEach(
        (e: ProblemEventDetail) => {
          e.timestamp = this.formatDate(e.timestamp);
          e.index = ((new Date(e.timestamp).valueOf() - new Date(b.start).valueOf()) /
            (Math.max(b.overrideMaxMinutes, b.board.maxMinutes) * 60000)) * 100;

          if (e.index === Infinity) {
            e.index = 0;
          }
        }
      ));
    });

    //boards = boards.filter(b => b.boardMaxMinutes + b.overrideMaxMinutes > 0);
    return boards;
  }

  summary(id: string): Observable<TeamSummary> {
    return this.http.get<TeamSummary>(`${this.url}/team/${id}/summary`);
  }

  enlist(teamId: string, code: string): Observable<boolean> {
    return this.http.put<boolean>(this.url + `/team/${teamId}/join/${code}`, {});
  }

  invite(id: string): Observable<TeamInviteCode> {
    return this.http.put<TeamInviteCode>(this.url + `/team/${id}/code`, {});
  }

  create(model: TeamCreate): Observable<TeamDetail> {
    return this.http.post<TeamDetail>(this.url + '/teams', model);
  }

  update(id: string, model: TeamUpdate): Observable<any> {
    return this.http.put(this.url + `/team/${id}`, model);
  }

  updateBadges(model: TeamBadgeUpdate[]): Observable<any> {
    return this.http.put(this.url + `/teams/badges`, model);
  }

  disable(model: string[]): Observable<any> {
    return this.http.put(this.url + `/teams/disable`, model);
  }

  enable(model: string[]): Observable<any> {
    return this.http.put(this.url + `/teams/enable`, model);
  }

  overrideMaxMinutes(model: TeamBoardUpdate): Observable<TeamDetail> {
    return this.http.put(this.url + `/teamboard`, model);
  }

  getScore(id: string): Observable<TeamBoardDetail> {
    return this.http.get<TeamBoardDetail>(this.url + `/teamboard/${id}/score`);
  }

  getOrganizations(): Observable<OrganizationDetail[]> {
    return this.http.get<OrganizationDetail[]>(this.url + `/organizations`);
  }

  lock(id: string): Observable<boolean> {
    return this.http.put<boolean>(this.url + `/team/${id}/lock`, {});
  }

  leave(id: string): Observable<boolean> {
    return this.http.put<boolean>(this.url + `/team/${id}/leave`, {});
  }

  removeUser(id: string, userId: string): Observable<boolean> {
    return this.http.delete<boolean>(this.url + `/team/${id}/user/${userId}`, {});
  }

  sendSystemMessage(message: string): Observable<boolean> {
    return this.http.put<boolean>(this.url + '/team/sendmessage/', message);
  }

  export(): void {
    if (this.exporting) {
    } else {
      this.exporting = true;
      this.http.get(`${this.url}/teams/export`, { responseType: 'arraybuffer' })
        .subscribe(response => {
          const name: string = 'team-export-' + this.settingsSvc.timestamp() + '.csv';
          this.settingsSvc.downLoadFile(response, name, 'application/ms-excel');
          this.exporting = false;
        });
    }
  }

  exportTeamActivity(): void {
    if (this.exporting) {
    } else {
      this.exporting = true;
      this.http.get(`${this.url}/teams/activity/export`, { responseType: 'arraybuffer' })
        .subscribe(response => {
          const name: string = 'team-activity-' + this.settingsSvc.timestamp() + '.csv';
          this.settingsSvc.downLoadFile(response, name, 'application/ms-excel');
          this.exporting = false;
        });
    }
  }
}

