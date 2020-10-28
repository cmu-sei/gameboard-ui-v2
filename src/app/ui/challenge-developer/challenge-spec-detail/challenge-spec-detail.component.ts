// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { ChallengeSpec } from 'src/app/models';

@Component({
  selector: 'app-challenge-spec-detail',
  templateUrl: './challenge-spec-detail.component.html',
  styleUrls: ['./challenge-spec-detail.component.scss']
})
export class ChallengeSpecDetailComponent implements OnInit {
  @Input() challenge: ChallengeSpec;

  constructor() { }

  ngOnInit() {
  }
}

