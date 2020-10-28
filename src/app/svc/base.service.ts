/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SettingsService } from './settings.service';
import { PagedResult, DataFilter } from '../models';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

export abstract class BaseService<TDetail, TEdit> {  

  constructor(
    public http: HttpClient,
    public authService: AuthService,
    public settingsService: SettingsService,
    public logger: LoggerService,
    private plural: string,
    private singular: string) {
  }

  protected baseUrl(): string {
    let url = this.settingsService.settings.coreUrl;
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }

  public get(id: string): Observable<TDetail> {
    return this.observable(this.http.get<TDetail>(this.baseUrl() + '/' + this.singular + '/' + id), 'get');
  }

  public getAll(dataFilter: DataFilter): Observable<PagedResult<TDetail>> {
    return this.observable(this.http.get<PagedResult<TDetail>>(this.baseUrl() + '/' + this.plural +      
      this.authService.queryStringify(dataFilter, '?')), 'getAll');
  }

  public create(model: TEdit): Observable<TDetail> {
    return this.observable(this.http.post<TDetail>(this.baseUrl() + '/' + this.plural, model), 'create');
  }

  public update(id: string, model: TEdit): Observable<TDetail> {
    return this.observable(this.http.put<TDetail>(this.baseUrl() + '/' + this.singular + '/' + id, model), 'update');
  }

  public delete(id: string): Observable<boolean> {
    return this.observable(this.http.delete<boolean>(this.baseUrl() + '/' + this.singular + '/' + id), 'delete')
  }

  observable<T>(request: Observable<T>, value: string): Observable<T>
  {
    return request.pipe(
      tap(data => this.logger.log('response:', value, data)),
      catchError(err => throwError(err)));
  }
}


