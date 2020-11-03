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

import { Subscription } from 'rxjs';
import { MessageService } from '../svc/message.service';
import { OnDestroy } from '@angular/core';

export abstract class BaseComponent implements OnDestroy {
  public subs: Array<Subscription> = [];

  constructor() { }

  ngOnDestroy(): void {
    this.subs.forEach(s => {
      if (!s.closed) { s.unsubscribe(); }
    });
  }

  formatDate(value: any): Date | undefined {
    if (value)
      return new Date(value.toString());

    return null;
  }

  private objectToString(value: any): string {
    return JSON.stringify(value);
  }

  private stringToObject(value: string): any {
    return JSON.parse(value);
  }

  public getStorageItem<T>(key: string): T {
    const stored = localStorage.getItem(key);
    if (!!stored) {
      return this.stringToObject(stored) as T;
    }

    return null;
  }

  public setStorageItem(key: string, value: any): void {
    const to = this.objectToString(value);

    if (!!value) {
      localStorage.setItem(key, to);
    }
    else {
      localStorage.removeItem(key);
    }
  }


  deepCopy<T>(obj: T): T {
    var copy;

    if (null == obj || "object" != typeof obj) return obj;

    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.deepCopy(obj[attr]);
      }
      return copy;
    }

    throw new Error("unable to deep copy object.");
  }
}

