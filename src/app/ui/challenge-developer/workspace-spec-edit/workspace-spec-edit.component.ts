/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE
MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO
WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING,
BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY,
EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON
UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM
PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see LICENSE.md or contact
permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release
and unlimited distribution.  Please see Copyright notice for non-US Government
use and distribution.

DM20-0284
*/

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

