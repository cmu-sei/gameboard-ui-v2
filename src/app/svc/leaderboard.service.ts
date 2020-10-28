// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataFilter, Leaderboard, LeaderboardScore } from '../models';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  url: string;
  exporting: boolean = false;

  constructor(
    private http: HttpClient,
    private settingsSvc: SettingsService,
    private auth: AuthService,
    private config: SettingsService
  ) {
    this.url = settingsSvc.settings.coreUrl;
    if (!this.url.endsWith('/api')) {
      this.url += '/api';
    }
  }

  public export(id: string): void {
    if (!this.exporting) {
      this.exporting = true;
      this.http.get(`${this.url}/leaderboard/${id}/export`, { responseType: 'arraybuffer' })
        .subscribe(response => {
          const name: string = 'leaderboard-' + this.config.timestamp() + '.csv';
          this.config.downLoadFile(response, name, 'application/ms-excel');
          this.exporting = false;
        });
    }
  }

  public load(boardId: string, search: DataFilter): Observable<Leaderboard> {
    return this.http.get<Leaderboard>(this.url + '/leaderboard/' + boardId +
      this.auth.queryStringify(search, '?'));
  }

  public loadByTeam(boardId: string, teamId: string): Observable<LeaderboardScore> {
    return this.http.get<LeaderboardScore>(this.url + `/leaderboard/${boardId}/team/${teamId}`);
  }

  public refresh(): Observable<boolean> {
    return this.http.post<boolean>(this.url + `/leaderboard`, null);
  }
}

