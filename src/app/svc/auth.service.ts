/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Injectable } from '@angular/core';
import { User, UserManager, WebStorageStateStore, Log } from 'oidc-client';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable()
export class AuthService {
    mgr: UserManager;
    authority: string;
    redirectUrl: string;
    lastCall: number;
    oidcUser: User;
    public tokenState$: BehaviorSubject<AuthToken> = new BehaviorSubject<AuthToken>({state: AuthTokenState.invalid});

    constructor(
        private settingsSvc: SettingsService
    ) {
        // Log.level = Log.DEBUG;
        // Log.logger = console;
        // Use this if you want a setting to toggle between session/local storage
        if (this.settingsSvc.settings.oidcLocalStorage) {
            (this.settingsSvc.settings.oidc.userStore as any) = new WebStorageStateStore({});
        }
        this.authority = this.settingsSvc.settings.oidc.authority.replace(/https?:\/\//, '');
        this.mgr = new UserManager(this.settingsSvc.settings.oidc);
        this.mgr.events.addUserLoaded(user => { this.onTokenLoaded(user); });
        this.mgr.events.addUserUnloaded(() => { this.onTokenUnloaded(); });
        this.mgr.events.addAccessTokenExpiring(e => { this.onTokenExpiring(); });
        this.mgr.events.addAccessTokenExpired(e => { this.onTokenExpired(); });
        this.mgr.events.addUserSignedOut(() =>  { this.onTokenExpired(); });
        this.mgr.getUser().then((user) => {
            this.onTokenLoaded(user);
        });
    }

    async isAuthenticated(): Promise<boolean> {
        const state = this.tokenState$.getValue();
        if (state === AuthTokenState.valid || state === AuthTokenState.expiring) {
            return Promise.resolve(true);
        }

        const user = await this.mgr.getUser();
        if (!!user) {
            return Promise.resolve(true);
        }
    }

    access_token(): string {
        return ((this.oidcUser)
            ? this.oidcUser.access_token
            : 'no_token');
    }

    auth_header(): string {
        this.markAction();
        return ((this.oidcUser)
            ? this.oidcUser.token_type + ' ' + this.oidcUser.access_token
            : 'no_token');
    }

    markAction() {
        this.lastCall = Date.now();
    }

    private onTokenLoaded(user: User) {
        this.oidcUser = user;
        this.tokenState$.next(
            (user)
            ? { subject: this.oidcUser.profile.sub, state: AuthTokenState.valid, profile: this.oidcUser.profile }
            : { state: AuthTokenState.invalid}
        );
    }

    private onTokenUnloaded() {
        this.oidcUser = null;
        this.tokenState$.next({ state: AuthTokenState.invalid});
    }

    private onTokenExpiring() {
        if (Date.now() - this.lastCall < 30000) {
            this.silentLogin();
        } else {
            this.tokenState$.next({subject: this.oidcUser.profile.sub, state: AuthTokenState.expiring});
        }
    }

    private onTokenExpired() {
        this.tokenState$.next({state: AuthTokenState.expired});

        // this.logout();
        // give any clean process 5 seconds or so.
        setTimeout(() => {
            this.mgr.removeUser();
        }, 5000);
    }

    externalLogin(url: string) {
        this.mgr.signinRedirect({ state: url })
            .then(() => {})
            .catch(err => {
                console.log(err);
            });
    }

    externalLoginCallback(url: string): Promise<User> {
        return this.mgr.signinRedirectCallback(url);
    }

    logout() {
        if (this.oidcUser) {
            this.mgr.signoutRedirect()
            .then(() => {})
            .catch(err => {
                console.log(err.text());
            });
        }
    }

    silentLogin() {
        this.mgr.signinSilent().then(() => { });
    }

    silentLoginCallback(): void {
        this.mgr.signinSilentCallback();
    }

    clearStaleState(): void {
        this.mgr.clearStaleState();
    }

    expireToken(): void {
        this.mgr.removeUser();
    }

    encodeKVP(key: string, value: string) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }

    queryStringify(obj: object, prefix?: string) {
        const segments = [];
        // tslint:disable-next-line:forin
        for (const p in obj) {
            const prop = obj[p];
            if (prop) {
                if (Array.isArray(prop)) {
                    prop.forEach(element => {
                        segments.push(this.encodeKVP(p, element));
                    });
                } else {
                    segments.push(this.encodeKVP(p, prop));
                }
            }
        }
        const qs = segments.join('&');
        return (qs) ? (prefix || '') + qs : '';
    }
}

export interface AuthToken {
    subject?: string;
    state?: AuthTokenState;
    profile?: any;
}

export enum AuthTokenState {
    valid = 'valid' as any,
    invalid = 'invalid' as any,
    expiring = 'expiring' as any,
    expired = 'expired' as any
}

