// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BoardTimes, ProblemEventDetail, TeamBoardEventDetail, TeamDetail, UserProfile } from '../../models';
import { TeamService } from '../../svc/team.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamDetailComponent extends BaseComponent implements OnInit {
  profile: UserProfile;
  team: TeamDetail;
  id: string;
  boardTimes: BoardTimes[] = [];
  boardEvents: Array<TeamBoardEventDetail>;

  constructor(
    private main: HomeComponent,
    private userSvc: UserService,
    private teamSvc: TeamService,
    private router: Router,
    private route: ActivatedRoute
  ) { super(); }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = params.id;
        this.loadUser();
      }
    );
  }

  loadUser() {
    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.profile = profile;
        this.loadTeam();

      }, err => this.main.error(err)));
  }

  loadTeam() {
    this.subs.push(this.teamSvc.load(this.id).subscribe(result => {
      this.team = result;
      this.loadTeamBoardEvents();
    }, err => this.main.error(err)));
  }

  loadTeamBoardEvents() {
    this.subs.push(this.teamSvc.loadTeamBoardEvents(this.id).subscribe(boards => {
      this.boardEvents = this.teamSvc.generateTeamBoardEvents(boards, this.boardTimes);
    }, err => this.main.error(err)));
  }
}

