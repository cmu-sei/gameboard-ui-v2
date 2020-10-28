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

