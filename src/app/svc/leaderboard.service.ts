/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

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

