// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

// Copyright 2019 Carnegie Mellon University. All Rights Reserved.
// Released under a 3 Clause BSD-style license. See LICENSE.md in the project root for license information.
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanActivateChild {

    constructor(
        private authSvc: AuthService,
        private settingsSvc: SettingsService,
        private router: Router
    ) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {

        return this.authSvc.isAuthenticated().then(a => {
            if (a) { return a; }
            this.authSvc.redirectUrl = state.url;
            this.router.navigate(['/login']);
            return false;
        });
    }

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
        ): Promise<boolean> {

        return this.canActivate(route, state);
    }

}

