// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { PageLocation, ProblemEventDetail } from '../../models';
import { LoggerService } from '../../svc/logger.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-horizon',
  templateUrl: './event-horizon.component.html',
  styleUrls: ['./event-horizon.component.scss']
})
export class EventHorizonComponent implements OnInit {
  @Input() events: Array<ProblemEventDetail>;  

  constructor(public logger: LoggerService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.logger.log(this.events);
  }
}

