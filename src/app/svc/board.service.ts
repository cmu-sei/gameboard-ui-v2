/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BoardCompletionReport, BoardDetail, TeamBoardDetail, TeamBoardStatus, ChallengeSurveyReport, TeamDetail } from '../models';
import { LoggerService } from './logger.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  url: string;
  cache: Array<BoardDetail>;
  last = 0;
  exporting = false;

  constructor(
    private http: HttpClient,
    private config: SettingsService,
    private logger: LoggerService
  ) {   

    this.url = config.settings.coreUrl;
    if (!this.url.endsWith('/api')) {
      this.url += '/api';
    }    
  }

  public load(id: string): Observable<BoardDetail> {
    return this.http.get<BoardDetail>(this.url + '/board/' + id);
  }

  public loadByTeam(id: string, teamId: string): Observable<BoardDetail> {
    return this.http.get<BoardDetail>(this.url + '/board/' + id + '/team/' + teamId);
  }

  public status(id: string): Observable<TeamBoardStatus> {
    return this.http.get<TeamBoardStatus>(this.url + '/board/' + id + '/status');
  }

  public start(id: string): Observable<TeamBoardDetail> {
    return this.http.post<TeamBoardDetail>(this.url + '/board/' + id + '/start', null);
  }

  public loadAll(): Observable<Array<BoardDetail>> {
    return this.http.get<Array<BoardDetail>>(this.url + '/boards/');
  }

  public loadCompletionReports(): Observable<Array<BoardCompletionReport>> {
    return this.http.get<Array<BoardCompletionReport>>(`${this.url}/report/completion`);
  }

  public loadCompletionReport(id: string): Observable<BoardCompletionReport> {
    return this.http.get<BoardCompletionReport>(`${this.url}/report/completion/board/${id}`);
  }

  public exportBoardCompletionReport(id: string): void {
    if (this.exporting) {
    } else {
      this.exporting = true;
      this.http.get(`${this.url}/report/completion/board/${id}/export`, { responseType: 'arraybuffer' })
        .subscribe(response => {
          const name: string = 'completion-report-' + this.config.timestamp() + '.csv';
          this.config.downLoadFile(response, name, 'application/ms-excel');
          this.exporting = false;
        });
    }
  }

  public downloadCertificate(id: string): void {
    if (this.exporting) {
    } else {
      this.exporting = true;
      this.http.get(`${this.url}/board/${id}/certificate`, { responseType: 'arraybuffer' })
        .subscribe(response => {
          const name: string = 'certificate-' + this.config.timestamp() + '.png';
          this.config.downLoadFile(response, name, 'image/png');
          this.exporting = false;
        });
    }
  }

  public loadChallengeSurveyReport(id: string): Observable<ChallengeSurveyReport> {
    return this.http.get<ChallengeSurveyReport>(`${this.url}/report/challenge-survey/board/${id}`);
  }

  public exportChallengeSurveyReport(id: string): void {
    if (this.exporting) {
    } else {
      this.exporting = true;
      this.http.get(`${this.url}/report/challenge-survey/board/${id}/export`, { responseType: 'arraybuffer' })
        .subscribe(response => {
          const name: string = 'challenge-survey-report-' + this.config.timestamp() + '.csv';
          this.config.downLoadFile(response, name, 'application/ms-excel');
          this.exporting = false;
        });
    }
  }

  public list(): Observable<Array<BoardDetail>> {
    return (this.last + 300000 < new Date().valueOf())
      ? this.http.get<Array<BoardDetail>>(this.url + '/boards').pipe(
        map(data => {
          return data;
        }),
        tap((data: BoardDetail[]) => {
            this.cache = data;
            if (!this.last) {
              this.config.boardChanged(this.default());
            }
            this.last = new Date().valueOf();
          })
        )
      : of(this.cache);
  }

  public default(): BoardDetail {
    return this.cache
      .filter(b => new Date(b.startTime).valueOf() < new Date().valueOf())
      .pop();
  }

  public updateBoardState(b: BoardDetail) {
    const now = Date.now();
    if (!b.state) { b.state = {}; }
    
    const start = new Date(b.startTime).valueOf();
    const stop = new Date(b.stopTime).valueOf();

    b.state.open = start < 0 || now > start;    
    b.state.expired = stop > 0 && now > stop;
    b.state.active = b.state.open && !b.state.expired;

    let timespan: number = 0;

    if (b.state.active && stop > 0) {      
      timespan = stop - now;
    }
    else if (!b.state.open && start > 0) {
      timespan = start - now;
    }

    b.state.timespan = timespan;

    this.logger.log('updateBoardState', b);
  }

  public updateTeamBoardState(tb: TeamBoardDetail) {
    const now = Date.now();
    if (!tb.state) { tb.state = {}; }

    const stopTime = new Date(tb.board.stopTime);

    const startDate = new Date(tb.start).valueOf();

    const startZero = startDate < 0;
    const startNow = now > startDate;

    tb.state.open = startZero || startNow;
    tb.maxMinutes = Math.max(tb.board.maxMinutes, tb.overrideMaxMinutes);

    if (tb.state.open) {
      if (tb.maxMinutes > 0) {
        let ends = new Date(tb.start).valueOf() + (tb.maxMinutes * 60000);

        if (stopTime.valueOf() > 0 && stopTime.valueOf() < ends) {
          ends = stopTime.valueOf();
        }        

        tb.state.expired = now > ends;
        tb.state.active = !tb.state.expired;
        tb.state.timespan = tb.state.active
          ? ends - now : 0;
      } else {
        tb.state.active = true;
      }
    }

    this.logger.log('updateTeamBoardState', tb);
  }

  public reset(id: string): Observable<TeamBoardDetail> {
    return this.http.post<TeamBoardDetail>(this.url + '/board/' + id + '/reset', null);
  }

  public resetTeamBoard(boardId: string, teamId: string): Observable<TeamDetail> {
    return this.http.post<TeamDetail>(this.url + '/board/' + boardId + '/team/' + teamId + '/reset', null);
  }
}

