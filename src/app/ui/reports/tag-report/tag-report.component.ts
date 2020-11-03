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
import { ReportService } from '../../../svc/report.service';
import { BaseComponent } from '../../base.component';
import { HomeComponent } from '../../home/home.component';
import { ChallengeTagReport } from '../../../models';

@Component({
  selector: 'app-tag-report',
  templateUrl: './tag-report.component.html',
  styleUrls: ['./tag-report.component.scss']
})
export class TagReportComponent extends BaseComponent implements OnInit { 

  model: ChallengeTagReport;
  tags: string[];

  constructor(
    private main: HomeComponent,
    private reportService: ReportService
  ) {
    super();
  }

  ngOnInit() {

    this.subs.push(this.reportService.getAllTags().subscribe(result => this.tags = result));

    this.subs.push(this.reportService.getChallengeTagReport().subscribe(result => this.model = result));

  }
}

