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
import { MarkedOptions, MarkedRenderer } from 'ngx-markdown';
import { UserManagerSettings } from 'oidc-client';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BoardDetail, BoardMap } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  url = 'assets/settings.json';
  settings: Settings = {
    applicationName: 'Gameboard',
    applicationBlurb: 'A gameboard for quiz challenges',
    coreUrl: '/api',    
    leaderPageSize: 10,
    showLogos: false,
    message: {
      icon: 'fa-4x fa fa-trophy',
      primaryText: `Team Competition`,
      secondaryText: 'Cybersecurity Competition'
    }
  };
  lastMapId = '';

  private currentBoard: BoardDetail;
  currentBoard$ = new BehaviorSubject<BoardDetail>(this.currentBoard);

  constructor(
    private http: HttpClient,
  ) {

  }

  public load(): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.get<Settings>(this.url)
        .pipe(
          catchError((e): any => {            
            console.log('invalid settings.json');
            return of(new Object());
          })
        )
        .subscribe((data: Settings) => {
          const oidc = this.settings.oidc;
          this.settings = { ...this.settings, ...data };
          this.settings.oidc = { ...oidc, ...data.oidc };
          this.http.get(this.url.replace(/json$/, 'env.json'))
            .pipe(
              catchError((): any => {
                return of(new Object());
              })
            )
            .subscribe((customData: Settings) => {
              const envoidc = this.settings.oidc;
              this.settings = { ...this.settings, ...customData };
              this.settings.oidc = { ...envoidc, ...customData.oidc };
              resolve(true);
            });
        });
    });
  }

  protected baseUrl(): string {
    let url = this.settings.coreUrl;
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    return url;
  }

  public status(): Observable<StatusDetail> {
    return this.http.get<StatusDetail>(this.baseUrl() + '/status');
  }

  public canEnroll(): boolean {
    return !this.settings.enrollmentEnds
      || new Date(this.settings.enrollmentEnds).valueOf() > new Date().valueOf();
  }

  public boardChanged(board: BoardDetail) {
    this.currentBoard = board;    
    this.currentBoard$.next(board);
  }

  downLoadFile(data: any, name: string, type: string) {
    const blob = new Blob([data], { type });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }


  timestamp(): string {
    const date: Date = new Date();
    const month: number = date.getUTCMonth() + 1;
    const day: number = date.getUTCDate();
    const year: number = date.getUTCFullYear();
    const hours: number = date.getUTCHours();
    const minutes: number = date.getUTCMinutes();
    const seconds: number = date.getUTCSeconds();

    return year + '-' + month + '-' + day + '-' + hours + minutes + seconds;
  }
}

export interface StatusDetail {
  commit?: string;
  status?: ApiStatus;
}

export interface ApiStatus {
  available?: boolean;
  modules?: ApiStatusModule[];
}

export interface ApiStatusModule {
  name?: string;
  version?: string;
  build?: Date;
}

export interface Settings {
  applicationName?: string;
  applicationBlurb?: string;
  commit?: string;
  coreUrl?: string;
  docUrl?: string;
  docToc?: string;  
  leaderPageSize?: number;
  showLogos?: boolean;
  enrollmentEnds?: Date;
  oidc?: UserManagerSettings;
  oidcLocalStorage?: boolean;  
  message?: HeaderMessage;
  branding?: Branding;
  badge?: BadgeSettings;
  environment?: EnvironmentSettings;
  finalsMap?: Array<BoardMap>;
}

export interface Branding {
  sidebar?: SidebarSettings;
  header?: HeaderSettings;
  enrollmentMessage?: string;
}

export interface EnvironmentSettings {
  mode?: string;
  resetMinutes?: number;
}

export interface SidebarSettings {
  logo?: Image;
}

export interface HeaderSettings {
  logo?: Image;
  message?: HeaderMessage;
}

export interface Image {
  url?: string;
  alt?: string;
  style?: any;
}

export interface HeaderMessage {
  icon?: string;
  primaryText?: string;
  secondaryText?: string;
}

export interface BadgeSettings {
  defaults?: BadgeDefaults;
  items?: BadgeItem[];
}

export interface BadgeDefaults {
  textCss?: string;
  disabledTextCss?: string;
  iconCss?: string;
  disabledIconCss?: string;
}

export interface BadgeItem {
  key?: string;
  hint?: string;
  css?: string;
  type?: string;
  icon?: string;
}

// function that returns `MarkedOptions` with renderer override
export function markedOptionsFactory(): MarkedOptions {
  const renderer = new MarkedRenderer();

  renderer.image = (href, title, text) => {
    return `<div class="text-center"><img class="img-fluid" src=${href} alt="${text}" /></div>`;
  };
  renderer.blockquote = (quote) => {
    return `<blockquote class="blockquote">${quote}</blockquote>`;
  };

  renderer.link = (href, title, text) => {
    if (href.match(/\/console\//)) {
      return `
                <a class="btn btn-secondary btn-vm"
                    href=${href} target="_blank" rel="noopener noreferrer">
                    <i class="fa fa-tv"></i>
                    ${text}
                </a>`;
    }
    return `<a href=${href}>${text}</a>`;
  };

  return {
    renderer,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false
  };
}

