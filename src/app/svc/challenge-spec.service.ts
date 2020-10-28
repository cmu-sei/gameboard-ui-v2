// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChallengeSpec, DataFilter, PagedResult } from '../models';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ChallengeSpecService {
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

  public add(model: ChallengeSpec): Observable<ChallengeSpec> {
    return this.http.post<ChallengeSpec>(`${this.url}/spec/challenges`, model);
  }

  public update(slug: string, model: ChallengeSpec): Observable<ChallengeSpec> {
    return this.http.put<ChallengeSpec>(`${this.url}/spec/challenge/${slug}`, model);
  }

  public delete(slug: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.url}/spec/challenge/${slug}`, {});
  }

  public load(slug: string): Observable<ChallengeSpec> {
    return this.http.get<ChallengeSpec>(`${this.url}/spec/challenge/${slug}`);
  }

  public loadAll(search: DataFilter): Observable<PagedResult<ChallengeSpec>> {
    return this.http.get<PagedResult<ChallengeSpec>>(`${this.url}/spec/challenges` +
      this.auth.queryStringify(search, '?'));
  }
}

