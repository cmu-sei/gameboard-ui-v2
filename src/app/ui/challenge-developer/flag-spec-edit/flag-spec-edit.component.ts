/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

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

