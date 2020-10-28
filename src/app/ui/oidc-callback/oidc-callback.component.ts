// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { AuthService } from 'src/app/svc/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from '../../svc/logger.service';

@Component({
  selector: 'app-oidc-callback',
  templateUrl: './oidc-callback.component.html',
  styleUrls: ['./oidc-callback.component.scss']
})
export class OidcCallbackComponent {

  authmsg = '';

  constructor(
    private authSvc: AuthService,
    private router: Router,
    private logger: LoggerService
  ) {
    this.authSvc.externalLoginCallback('')
      .then(
        (user) => {
          this.router.navigateByUrl(user.state || '/');
        },
        (err) => {
          this.logger.log(err);
          let msg: string = (err.error || err).message;
          if (msg.match(/in the (future|past)/)) {
            msg = 'Login failed because of clock skew between you and the identity server.';
          }
          this.authmsg = msg;
        }
      );
   }

}

