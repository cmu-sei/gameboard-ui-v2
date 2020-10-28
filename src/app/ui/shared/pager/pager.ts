// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, EventEmitter, Output } from "@angular/core";
import { DataFilter, PagedResult } from '../../../models';

@Component({
  selector: 'pager',
  templateUrl: './pager.html'
})

export class PagerComponent<T> {
  @Input() public dataFilter: DataFilter;;

  private _pagedResult: PagedResult<T>;

  get pagedResult(): PagedResult<T> {
    return this._pagedResult;
  }

  public state: PagerButtonState = { start: false, previous: false, next: false, end: false };

  @Input() set pagedResult(pagedResult: PagedResult<T>) {
    this._pagedResult = pagedResult;
    
    const pr = pagedResult;
    const df = pr.dataFilter;
    const st = df.skip + 1;
    let en = st + df.take - 1;

    if (df.take === 0 || en > pr.total) {
      en = pr.total;
    }

    const all = df.take === 0;

    this.state.start = !all && df.skip !== 0;
    this.state.previous = !all && df.skip !== 0;
    this.state.next = !all && (df.skip + df.take < pr.total);
    this.state.end = !all && (df.skip + df.take < pr.total);

    this.pageText = st + ' to ' + en + ' of ' + pagedResult.total;
  }

  @Output() public onPageChanged: EventEmitter<any> = new EventEmitter();
  @Output() public onPageSizeChanged: EventEmitter<any> = new EventEmitter();

  public pageText: string = '';
  public takes: Take[] = [
    { label: 10, value: 10 },
    { label: 20, value: 20 },
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 200, value: 200 },
    { label: 'All', value: 0 }
  ];

  constructor() { }

  pageSizeChanged() {

    this.onPageSizeChanged.emit(this.dataFilter);
  }

  pageChanged(verb) {

    let skip: number = parseInt(this.dataFilter.skip.toString());
    const take: number = parseInt(this.dataFilter.take.toString());
    const total: number = parseInt(this.pagedResult.total.toString());

    if (verb === 'start') {
      skip = 0;
    }

    if (verb === 'previous') {
      skip = skip - take;
      skip = skip < 0 ? 0 : skip;
    }

    if (verb === 'next') {
      skip = skip + take;
      skip = skip > total
        ? Math.floor(total / take) * take
        : skip;
    }

    if (verb === 'end') {
      skip = Math.floor(total / take) * take;
    }

    this.dataFilter.take = take;
    this.dataFilter.skip = skip;

    this.onPageChanged.emit(this.dataFilter);
  }
}

export class PagerButtonState
{
  start: boolean = false;
  previous: boolean = false;
  next: boolean = false;
  end: boolean = false;
}

export class Take {
  label: any;
  value: number;
}

