// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timespan'
})
export class TimespanPipe implements PipeTransform {

  transform(value: number, format?: string): any {
    if (value === 0) {
      return '';
    }

    const g = Math.abs(value / 1000);
    let h = Math.floor(g / 3600);
    const m = Math.floor((g - h * 3600) / 60);
    const s = Math.floor(g - h * 3600 - m * 60);

    if (format === 'object') {
      const timespan: Timespan = {
        hours: h.toString().padStart(2, '0'),
        minutes: m.toString().padStart(2, '0'),
        seconds: s.toString().padStart(2, '0')
      };

      return timespan;
    }

    if (format === 'analog') {
      const d = Math.floor(g / (24 * 60 * 60));
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

interface Timespan {
  hours?: string;
  minutes?: string;
  seconds?: string;
}


