// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toctitle'
})
export class TocTitlePipe implements PipeTransform {

  transform(value: string, ...args: any[]): any {
    return value.replace(/_/g, ' ');
  }

}

