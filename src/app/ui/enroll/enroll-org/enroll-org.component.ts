/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationDetail, UserProfile } from 'src/app/models';
import { TeamService } from 'src/app/svc/team.service';
import { UserService } from 'src/app/svc/user.service';
import { BaseComponent } from '../../base.component';
import { HomeComponent } from '../../home/home.component';

@Component({
  selector: 'app-enroll-org',
  templateUrl: './enroll-org.component.html',
  styleUrls: ['./enroll-org.component.scss']
})
export class EnrollOrgComponent extends BaseComponent implements OnInit {
  orgs: Array<OrganizationDetail> = [];
  filteredOrgs: Array<OrganizationDetail> = [];
  active: OrganizationDetail = {};
  profile: UserProfile;

  constructor(
    private main: HomeComponent,
    private router: Router,
    private userSvc: UserService,
    private teamService: TeamService
  ) {
    super();
  }

  ngOnInit() {

    this.subs.push(this.userSvc.user$.subscribe(
      (profile: UserProfile) => {
        this.profile = profile;
        if (!!profile) {
          this.subs.push(this.teamService.getOrganizations().subscribe((data) => {
            this.orgs = data;
            const target = this.canSelect() ? this.profile.user.organization : this.profile.team.organizationName;
            this.active = this.orgs.find(o => o.name === target);
            this.filteredOrgs = this.orgs;
          }));
        }
      }, e => this.main.error(e)
    ));
  }

  canSelect() {
    return !this.profile.team || this.profile.team.ownerUserId === this.profile.user.id;
  }

  selected(org: OrganizationDetail) {
    this.active = org;
  }

  saveOrganization() {
    if (!this.active) {
      this.main.warning('Please select an organization.');
    }
    else {
      if (this.profile) {
        if (this.profile.user.organization === this.active.name) {
          this.main.success('Organization saved!');
          this.router.navigate(['/enroll/enrollment']);
        }
        else {
          this.profile.user.organization = this.active.name;
          this.userSvc.updateUser().subscribe(() => {
            this.main.success('Organization saved!');
            this.userSvc.reload();
            this.router.navigate(['/enroll/enrollment']);
          });
        }
      }
    }
  }

  filter(e) {
    const term = e.target.value.toLowerCase();
    this.filteredOrgs = (!!term)
      ? this.orgs.filter(o => o.title.toLowerCase().match(term) || o.name.toLowerCase().match(term))
      : this.orgs;
  }
}

