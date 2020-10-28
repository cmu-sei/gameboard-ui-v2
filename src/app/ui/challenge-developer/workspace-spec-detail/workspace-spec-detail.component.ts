// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { WorkspaceSpec } from 'src/app/models';

@Component({
  selector: 'app-workspace-spec-detail',
  templateUrl: './workspace-spec-detail.component.html',
  styleUrls: ['./workspace-spec-detail.component.scss']
})
export class WorkspaceSpecDetailComponent implements OnInit {
  @Input() workspace: WorkspaceSpec;
  constructor() { }

  ngOnInit() {
  }

}

