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
import { SettingsService } from './settings.service';

import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DocService {
  url: string;
  tag: string;
  tocid: string;
  list: Array<string>;
  loaded$ = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private config: SettingsService
  ) {
    this.url = config.settings.docUrl;
    this.tocid = config.settings.docToc;
    this.tag = `?t=${new Date().valueOf()}`;
  }

  toc(): Observable<Array<string>> {
    return this.http.get<Array<string>>(`${this.url}/${this.tocid}${this.tag}`).pipe(
      switchMap((list) => {
        this.list = list;
        this.loaded$.next(true);
        const display = list.map(i => i.split('/').pop().split('-').reverse().pop().replace('.md', ''));
        return of(display);
      })
    );
  }

  load(id: string): Observable<string> {
    return this.http.get(this.url + '/' + id + this.tag, { responseType: 'text'}).pipe(
      map(text => {
        return text;
      })
    );
  }

  lookup(display: string): string {
    return this.list
      ? this.list.find(f => f === display || f.endsWith(display + '.md') || f.match(display + '-'))
      : '';
  }
}

