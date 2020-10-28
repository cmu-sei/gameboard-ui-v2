// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/svc/auth.service';

@Component({
  selector: 'app-login-prompt',
  templateUrl: './login-prompt.component.html',
  styleUrls: ['./login-prompt.component.scss']
})
export class LoginPromptComponent implements OnInit {

  constructor(
    private authSvc: AuthService
  ) { }

  ngOnInit() {
  }

  login() {
    this.authSvc.externalLogin(this.authSvc.redirectUrl);
  }
}

