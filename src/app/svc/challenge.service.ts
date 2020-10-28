// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChallengeProblem, SubmissionCreate, SubmissionDetail,
  ProblemConsoleDetail,  ProblemDetail, ProblemConsoleAction, PagedResult, GamespaceDetail, DataFilter, ChallengeStart, TokenDetail, TokenStatusType } from '../models';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';
import { Token } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  url: string;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private settingsSvc: SettingsService
  ) {
    this.url = settingsSvc.settings.coreUrl;
    if (!this.url.endsWith('/api')) {
      this.url += '/api';
    }
  }

  public load(id: string, teamId: string): Observable<ChallengeProblem> {
    const url = `${this.url}/challenge/${id}/team/${teamId}?${Date.now()}`;
    return this.http.get<ChallengeProblem>(url);
  }

  public reset(id: string): Observable<any> {
    const url = `${this.url}/challenge/${id}/reset`;
    return this.http.post<any>(url, null);
  }

  public restart(id: string): Observable<any> {
    const url = `${this.url}/challenge/${id}/restart`;
    return this.http.post<any>(url, null);
  }

  public submitChallenge(model: SubmissionCreate): Observable<SubmissionDetail> {
    return this.http.post<SubmissionDetail>(this.url + `/submissions`, model);
  }

  public startChallenge(id: string, flagIndex?: number): Observable<ProblemDetail> {
    const model: ChallengeStart = { challengeId: id };

    if (this.settingsSvc.settings.environment && this.settingsSvc.settings.environment.mode == 'Test') {
      model.flagIndex = flagIndex;
    }

    return this.http.post<ProblemDetail>(this.url + '/challenge/start', model);
  }

  public ticket(vmId: string, problemId: string): Observable<ProblemConsoleDetail> {
    return this.http.get<ProblemConsoleDetail>(this.url + `/problem/${problemId}/console/${vmId}`);
  }

  public vmAction(action: ProblemConsoleAction): Observable<any> {
    return this.http.put<any>(this.url + `/console/vmaction`, action);
  }

  public getGamespaces(search: DataFilter): Observable<PagedResult<GamespaceDetail>> {
    return this.http.get<PagedResult<GamespaceDetail>>(this.url + '/gamespaces' +
    this.auth.queryStringify(search, '?'));
  }

  public deleteGamespace(id: string): Observable<any> {
    return this.http.delete(this.url + `/problem/${id}/gamespace`);
  }

  public restartGamespace(id: string): Observable<any> {
    return this.http.put(this.url + `/problem/${id}/gamespace`, {});
  }

  private calculateAttemptCount(challengeProblem: ChallengeProblem): number {

    let count = 0;

    if (challengeProblem.challenge.isMultiStage) {      
      const submissions = challengeProblem.problem.submissions;

      let counts: number[] = [];

      challengeProblem.problem.tokens.forEach(x => counts.push(0));

      let index: number = 0;

      for (let si = 0; si < submissions.length; si++) {
        submissions[si].tokens.forEach(t => {
          if (t.status == TokenStatusType.Correct) {            
            if (index == t.index) index++;
            //counts[t.index] = -1;
          }
          else {
            counts[t.index]++;
          }

          if (t.status == TokenStatusType.Pending) {
            //counts[t.index] = 0;
          }

          if (t.status == TokenStatusType.Incorrect) {
            
          }

          
        });
      }

      console.log('index', index);
      console.log('counts', counts);

      count = index >= counts.length
        ? challengeProblem.board.maxSubmissions : counts[index];

    }
    else {
      count = challengeProblem.problem.submissions
        ? challengeProblem.problem.submissions.length
        : 0;
    }

    return count + 1
  }

  public updateState(challengeProblem: ChallengeProblem) {
    if (challengeProblem && challengeProblem.problem) {

      if (!challengeProblem.state) {
        challengeProblem.state = {};
      }

      if (new Date(challengeProblem.problem.end).valueOf() < 0) {
        challengeProblem.problem.end = null;
      }

      challengeProblem.state.isStarted = true;
      challengeProblem.state.isComplete = challengeProblem.problem.status === 'Complete' || !!challengeProblem.problem.end;
      challengeProblem.state.isError = challengeProblem.problem.status === 'Error';
      challengeProblem.state.isPending = challengeProblem.problem.status === 'Registered';
      challengeProblem.state.isActive = challengeProblem.problem.status === 'Ready' || challengeProblem.problem.status === 'InProgress';

      challengeProblem.state.attemptCount = this.calculateAttemptCount(challengeProblem);
      challengeProblem.state.attemptMax = challengeProblem.board.maxSubmissions;

      challengeProblem.state.canSubmit = challengeProblem.state.isActive &&
        (challengeProblem.board.maxSubmissions === 0 || challengeProblem.state.attemptCount <= challengeProblem.state.attemptMax);

      challengeProblem.state.grading = challengeProblem.problem.submissions
        && challengeProblem.problem.submissions.filter(s => s.status === 'submitted').length > 0;

      challengeProblem.state.restarting = challengeProblem.state.restarting && !challengeProblem.problem.gamespaceReady;

      challengeProblem.state.duration = new Date(
        (challengeProblem.problem.end)
          ? challengeProblem.problem.end
          : new Date()
        ).valueOf() - new Date(challengeProblem.problem.start).valueOf();

    } else {

      challengeProblem.state.isStarted = false;

    }
  }

}

