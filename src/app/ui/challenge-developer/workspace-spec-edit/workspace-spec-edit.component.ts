// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { WorkspaceSpec, NetworkSpec } from 'src/app/models';

@Component({
  selector: 'app-workspace-spec-edit',
  templateUrl: './workspace-spec-edit.component.html',
  styleUrls: ['./workspace-spec-edit.component.scss']
})
export class WorkspaceSpecEditComponent implements OnInit {

  @Input() workspace: WorkspaceSpec;

  constructor() { }

  ngOnInit() {
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  removeHost(network: NetworkSpec, i: number): void {
    network.hosts.splice(i, 1);
  }

  removeDnsmasq(network: NetworkSpec, i: number): void {
    network.dnsmasq.splice(i, 1);
  }

  removeVm(i: number): void {
    this.workspace.vms.splice(i, 1);
  }
}

