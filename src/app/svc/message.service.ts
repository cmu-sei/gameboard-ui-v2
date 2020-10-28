// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SystemMessage } from '../models';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  private listeners = new Subject<any>();

  listen(): Observable<any> {
    return this.listeners.asObservable();
  }

  notify(m: SystemMessage) {
    window.scroll(0, 0);
    this.listeners.next(m);
  }

  error(e: any) {
    this.notify({ type: 'error', value: e });
  }

  success(e: any) {
    this.notify({ type: 'success', value: e });
  }
}

