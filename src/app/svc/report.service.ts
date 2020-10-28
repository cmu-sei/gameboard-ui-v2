// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'; // since RxJs 6
import { ParticipationReport, ChallengeTagReport } from '../models';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  url: string;

  constructor(
    private http: HttpClient,
    private settingsSvc: SettingsService,
  ) {
    this.url = settingsSvc.settings.coreUrl;
    if (!this.url.endsWith('/api')) {
      this.url += '/api';
    }
  }

  getParticipationReport(): Observable<ParticipationReport> {
    return this.http.get<ParticipationReport>(this.url + '/report/participation');
  }

  getChallengeTagReport(): Observable<ChallengeTagReport> {
    return this.http.get<ChallengeTagReport>(this.url + '/report/challenge-tags');
  }

  getAllTags(): Observable<string[]> {
    return this.http.get<string[]>(this.url + '/tags');
  }
}

