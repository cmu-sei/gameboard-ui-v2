// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { FlagSpec } from 'src/app/models';

@Component({
  selector: 'app-flag-spec-edit',
  templateUrl: './flag-spec-edit.component.html',
  styleUrls: ['./flag-spec-edit.component.scss']
})
export class FlagSpecEditComponent implements OnInit {
  @Input() _flag: FlagSpec;

  get flag(): FlagSpec {
    return this._flag;
  }

  @Input('flag')
  set flag(value: FlagSpec) {
    this._flag = value;

    this.isLinear = false;

    this.updatePercent();
  }

  @Input() isMultiStage: boolean = false;

  constructor() { }

  totalPercent: number = 0;
  isLinear: boolean = false;

  ngOnInit() {

  }

  updatePercent() {
    this.totalPercent = 0;

    if (this._flag.tokens) {
      this._flag.tokens.forEach(x => {
        this.totalPercent += x.percent;
      });
    }
  }

  onMoveToken(index: number, direction: number): void {    
    [this.flag.tokens[index], this.flag.tokens[index + direction]] =
      [this.flag.tokens[index + direction], this.flag.tokens[index]];
  }

  addToken(): void {
    let percent: number = 0;

    if (!this.flag.tokens) {
      this.flag.tokens = [];
      percent = 100;
    }

    const index: number = this.flag.tokens.length;

    this.flag.tokens.push({ value: '', percent: percent })
  }

  removeToken(i: number): void {
    this.flag.tokens.splice(i, 1);
  }

  trackByFn(index: any, item: any) {
    return index;
  }
}

