// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GameDetail, SurveyReport } from '../models';
import { AuthService } from './auth.service';
import { BaseService } from './base.service';
import { LoggerService } from './logger.service';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class GameService extends BaseService<GameDetail, GameDetail> {
  url: string;
  exporting: boolean = false;

  constructor(
    http: HttpClient,
    auth: AuthService,
    private config: SettingsService,
    logger: LoggerService) {
    super(http, auth, config, logger, 'games', 'game');
  }

  public getDefault(): Observable<GameDetail> {
    return this.observable(this.http.get<GameDetail>(this.baseUrl() + '/game'), 'getDefault');
  }

  public loadSurveyReport(): Observable<SurveyReport> {
    return this.http.get<SurveyReport>(`${this.baseUrl()}/report/survey`);
  }

  public exportSurveyReport(): void {
    if (this.exporting) {
    } else {
      this.exporting = true;
      this.http.get(`${this.baseUrl()}/report/survey/export`, { responseType: 'arraybuffer' })
        .subscribe(response => {
          const name: string = 'survey-report-' + this.config.timestamp() + '.csv';
          this.config.downLoadFile(response, name, 'application/ms-excel');
          this.exporting = false;
        });
    }
  }

}

