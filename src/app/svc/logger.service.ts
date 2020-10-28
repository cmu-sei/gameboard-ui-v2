// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable, isDevMode } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  production: boolean = false;

  constructor() {
    this.production = environment.production;
    console.log('production', this.production)
  }

  log(message: any, ...optionalParams: any[]) {
    if (!this.production) {
      if (optionalParams && optionalParams.length)
        console.log(message, optionalParams);
      else
        console.log(message);
    }
    else {
      
    }    
  }
}

