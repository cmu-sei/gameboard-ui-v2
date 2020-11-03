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

import { Component, OnInit } from '@angular/core';
import { ChallengeService } from 'src/app/svc/challenge.service';
import { PagedResult, GamespaceDetail, ChallengeProblem, ProblemVm } from 'src/app/models';
import { Title } from '@angular/platform-browser';
import { BaseComponent } from '../base.component';
import { SettingsService, SidebarSettings } from 'src/app/svc/settings.service';

@Component({
  selector: 'app-gamespace-browser',
  templateUrl: './gamespace-browser.component.html',
  styleUrls: ['./gamespace-browser.component.scss']
})
export class GamespaceBrowserComponent extends BaseComponent implements OnInit {

  gamespaces: Array<GamespaceDetail> = [];
  current: GamespaceDetail;
  consoles: Array<ProblemVm> = [];
  showSelector = true;
  sidebar: SidebarSettings;

  constructor(
    private challengeSvc: ChallengeService,
    private titleSvc: Title,
    config: SettingsService
  ) {
    super();
    this.sidebar = config.settings.branding.sidebar;
  }

  ngOnInit() {
    this.titleSvc.setTitle(`${this.titleSvc.getTitle()} | Observer`);
    this.refresh();
  }

  refresh() {
    this.subs.push(
      this.challengeSvc.getGamespaces({ filter: 'running'}).subscribe(
        (data: PagedResult<GamespaceDetail>) => this.gamespaces = data.results
      )
    );
  }

  connectGamespace(gsd: GamespaceDetail) {
    this.consoles = [];
    this.current = gsd;
    this.subs.push(

      this.challengeSvc.load(gsd.challengeId, gsd.teamId).subscribe(
        (cp: ChallengeProblem) => {
          const test = cp.problem.gamespaceText.match(/\]\(\/console\/([^\)]*)/g).map(x => {
            const p = x.split('/');
            return { vmId: p[2], vmName: p[3], problemId: p[4] };
          });
          // console.log(test);
          this.consoles = test;
        }
      )

    );
  }
}

