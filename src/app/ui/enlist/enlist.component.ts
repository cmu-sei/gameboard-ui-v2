// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamService } from 'src/app/svc/team.service';
import { UserService } from 'src/app/svc/user.service';
import { MessageService } from '../../svc/message.service';
import { TeamSummary, UserProfile, UserDetail, OrganizationDetail } from 'src/app/models';
import { SettingsService } from 'src/app/svc/settings.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-enlist',
  templateUrl: './enlist.component.html',
  styleUrls: ['./enlist.component.scss']
})
export class EnlistComponent extends BaseComponent implements OnInit {
  code: string;
  team: TeamSummary;
  organization: OrganizationDetail;
  profile: UserProfile;
  enrollmentMessage: string;

  constructor(
    private main: HomeComponent,
    private route: ActivatedRoute,
    private router: Router,
    private teamSvc: TeamService,
    private userSvc: UserService,
    msgSvc: MessageService,
    private config: SettingsService
  )
  {
    super();
  }

  ngOnInit() {
    this.enrollmentMessage = this.config.settings.branding.enrollmentMessage;
    this.subs.push(
      this.userSvc.user$.subscribe(
        (profile: UserProfile) => {
          this.profile = profile;
          if (profile) {
            this.code = this.route.snapshot.paramMap.get('code');
            const teamId = this.route.snapshot.paramMap.get('teamId');
            this.teamSvc.summary(teamId).subscribe(
              (team: TeamSummary) => {
                this.team = team;

                this.subs.push(this.teamSvc.getOrganizations().subscribe(data => {
                  this.organization = data.find(o => o.name === team.organizationName);
                }));
              }
            );

          }
        }, err => this.main.error(err)
      ));
  }

  confirm() {

    this.profile.user.organization = this.organization.name;

    this.subs.push(this.userSvc.updateUser().subscribe(
      (user: UserDetail) => {

        this.teamSvc.enlist(this.team.id, this.code).subscribe(
          (result) => {
            this.userSvc.reload();
            this.main.success('You have joined a team.');
            this.router.navigate(['/']);
          }, err => {
            this.main.error(err);
          });
      }, err => this.main.error(err)
    ));
  }

}

