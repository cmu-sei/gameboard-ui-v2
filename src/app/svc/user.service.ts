/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, AuthTokenState, AuthToken } from './auth.service';
import { BehaviorSubject, Observable, of, forkJoin } from 'rxjs';
import { UserDetail, UserProfile, TeamDetail, MessageCreate, DataFilter, UserSummary, PagedResult, Answer, Question } from '../models';
import { SettingsService } from './settings.service';
import { switchMap, map, tap } from 'rxjs/operators';

@Injectable()
export class UserService {
  url: string;
  token: AuthToken;
  profile: UserProfile;
  public user$: BehaviorSubject<UserProfile> = new BehaviorSubject<UserProfile>(this.profile);

  constructor(
    private authSvc: AuthService,
    private http: HttpClient,
    private settingsSvc: SettingsService
  ) {
    this.url = settingsSvc.settings.coreUrl;
    if (!this.url.endsWith('/api')) {
      this.url += '/api';
    }

    this.authSvc.tokenState$.subscribe(
      (token: AuthToken) => {
        this.tokenStateChanged(token);
      }
    );
  }

  tokenStateChanged(token: AuthToken): void {
    this.token = token;
    switch (token.state) {
      case AuthTokenState.valid:
        this.reload();
        break;

      case AuthTokenState.invalid:
        this.profile = null;
        this.user$.next(this.profile);
        break;
    }
  }

  reload(): void {
    if (this.token) {
      this.load(this.token.subject).subscribe(
        (detail: UserProfile) => {
          this.profile = detail;
          this.profile.claims = this.token.profile;
          this.user$.next(this.profile);
        }
      );
    }
  }

  bakload(id: string): Observable<UserDetail> {
    return this.http.get<UserDetail>(`${this.url}/user/${id}`);
  }

  load(id: string): Observable<UserProfile> {

    return this.http.get<UserDetail>(`${this.url}/user/${id}`).pipe(
      switchMap((u: UserDetail) => {
        const q: Observable<TeamDetail> = (u && u.teamId)
          ? this.http.get<TeamDetail>(`${this.url}/team/${u.teamId}`)
          : of(null);

        return forkJoin(of(u), q).pipe(
          map(
            (result: any[]) => {
              return { user: result[0], team: result[1] } as UserProfile;
            }
          )
        );
      })
    );
  }

  loadAll(search: DataFilter): Observable<PagedResult<UserSummary>> {
    return this.http.get<PagedResult<UserSummary>>(this.url + '/users' +
      this.authSvc.queryStringify(search, '?'));
  }

  // allows components to get the current user with
  // optional data request
  getUser(reload?: boolean): Observable<UserProfile> {
    if (this.profile && !reload) {
      return of(this.profile);
    }

    return (this.token)
      ? this.load(this.token.subject)
      : of(null);
  }

  updateUser(): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.url}/user/${this.profile.user.id}`, this.profile.user).pipe(
      tap((user: UserDetail) => this.user$.next(this.profile))
    );
  }

  toggleModerator(id: string): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.url}/user/${id}/moderator`, null);
  }

  toggleObserver(id: string): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.url}/user/${id}/observer`, null);
  }

  toggleChallengeDeveloper(id: string): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.url}/user/${id}/challenge-developer`, null);
  }

  toggleGameDesigner(id: string): Observable<UserDetail> {
    return this.http.put<UserDetail>(`${this.url}/user/${id}/game-designer`, null);
  }

  public sendMessage(message: MessageCreate): Observable<boolean> {
    return this.http.post<boolean>(this.url + '/message', message);
  }

  public sendSurvey(survey: Answer[]): Observable<boolean> {
    return this.http.post<boolean>(this.url + '/survey', survey);
  }

  public sendChallengeSurvey(id: string, survey: Answer[]): Observable<boolean> {
    return this.http.post<boolean>(this.url + '/challenge/' + id + '/survey', survey);
  }

  public reset(id: string): Observable<UserDetail> {
    return this.http.post<UserDetail>(this.url + '/user/' + id + '/reset', null);
  }

  public loadSurvey(): Observable<any> {
    return this.getJSON('./assets/survey.json');
  }

  public loadChallengeSurvey(): Observable<any> {
    return this.getJSON('./assets/challengesurvey.json');
  }

  public isSurveyComplete(): Observable<boolean> {
    return this.http.get<boolean>(this.url + '/survey');
  }

  public isChallengeSurveyComplete(id: string): Observable<boolean> {
    return this.http.get<boolean>(this.url + '/challenge/' + id + '/survey');
  }

  public getJSON(path: string): Observable<any> {
    return this.http.get(path);
  }

  public getTicket(): Observable<any> {
    return this.http.get(this.url + '/user/ticket');
  }
}

