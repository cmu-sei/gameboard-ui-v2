// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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


