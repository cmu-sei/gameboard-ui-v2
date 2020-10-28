// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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

