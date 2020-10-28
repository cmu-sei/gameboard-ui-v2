// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { VmSpec } from 'src/app/models';

@Component({
  selector: 'app-vm-spec-edit',
  templateUrl: './vm-spec-edit.component.html',
  styleUrls: ['./vm-spec-edit.component.scss']
})
export class VmSpecEditComponent implements OnInit {

  @Input() vm: VmSpec;

  constructor() { }

  ngOnInit() {
  }

}

