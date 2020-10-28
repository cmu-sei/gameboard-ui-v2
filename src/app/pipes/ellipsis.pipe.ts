// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ellipsis'
})
export class EllipsisPipe implements PipeTransform {

  transform(value: string, len: number): any {
    let v = value.split('\n')[0].trim().slice(0, len);

    if (v.length === len) {
      v = v.indexOf(' ') >= 0
        ? v.substring(0, v.lastIndexOf(' '))
        : v.substring(0, len - 3);
      v += '...';
    }

    return v;
  }

}

