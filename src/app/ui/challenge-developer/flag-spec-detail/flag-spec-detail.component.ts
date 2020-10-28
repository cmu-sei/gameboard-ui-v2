// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { FlagSpec } from 'src/app/models';

@Component({
  selector: 'app-flag-spec-detail',
  templateUrl: './flag-spec-detail.component.html',
  styleUrls: ['./flag-spec-detail.component.scss']
})
export class FlagSpecDetailComponent implements OnInit {
  @Input() flag: FlagSpec;
  constructor() { }

  ngOnInit() {
  }
}

