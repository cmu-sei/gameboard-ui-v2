// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../svc/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private injector: Injector,
  ) { }

  private auth: AuthService;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isExcluded(req.url)) {
      return next.handle(req);
    }
    this.auth = this.injector.get(AuthService);

    const authHeader = this.auth.auth_header();
    const authReq = req.clone({ setHeaders: { Authorization: authHeader } });
    return next.handle(authReq);
  }

  private isExcluded(url: string): boolean {

    return !!url.split('?')[0].match(/(\.json|\.md)$/);

  }
}

