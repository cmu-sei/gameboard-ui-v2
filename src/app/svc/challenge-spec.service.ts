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

