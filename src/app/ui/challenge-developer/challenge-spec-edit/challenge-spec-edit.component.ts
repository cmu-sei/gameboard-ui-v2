// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, Input, OnInit } from '@angular/core';
import { ChallengeSpec, FlagSpec, NetworkSpec, VmSpec, WorkspaceSpec } from 'src/app/models';

@Component({
  selector: 'app-challenge-spec-edit',
  templateUrl: './challenge-spec-edit.component.html',
  styleUrls: ['./challenge-spec-edit.component.scss']
})
export class ChallengeSpecEditComponent implements OnInit {

  @Input() challenge: ChallengeSpec
  constructor() {
  }

  ngOnInit() {
  }
}

