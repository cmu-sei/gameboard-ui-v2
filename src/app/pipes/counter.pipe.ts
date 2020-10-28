// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'counter'
})
export class CounterPipe implements PipeTransform {

  transform(value: any, format?: string): any {
    if (!(value instanceof Date)) {
      value = new Date(value);
    }

    const duration = Math.abs((new Date().valueOf() - value.valueOf()) / 1000);
    let h = Math.floor(duration / 3600);
    const m = Math.floor((duration - h * 3600) / 60);
    const s = Math.floor(duration - h * 3600 - m * 60);

    if (format === 'analog') {
      const d = Math.floor(duration / (24 * 60 * 60));
      h = h - (d * 24);
      if (d > 0) { return `${d}d ${h}h`; }
      if (h > 0) { return `${h}h ${m}m`; }
      if (m > 5) { return `${m}m`; }
      if (m > 0) { return `${m}m ${s}s`; }
      return `${s}s`;
    }

    return h.toString().padStart(2, '0') + ':'
      + m.toString().padStart(2, '0') + ':'
      + s.toString().padStart(2, '0');
  }

}

