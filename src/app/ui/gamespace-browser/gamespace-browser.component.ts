// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

