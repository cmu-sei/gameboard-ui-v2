// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnInit, Output, ViewChild, TemplateRef } from "@angular/core";
import { ModalDirective, BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { BoardDetail, TeamBoardDetail, UserProfile } from '../../../models';
import { interval } from 'rxjs';
import { BaseComponent } from '../../base.component';
import { LoggerService } from '../../../svc/logger.service';
import { TimespanPipe } from '../../../pipes/timespan.pipe';

@Component({
  selector: 'app-board-header',
  templateUrl: './board-header.component.html',
  styleUrls: ['./board-header.component.scss']
})

export class BoardHeaderComponent extends BaseComponent implements OnInit {
  @Input() public board: BoardDetail;
  @Input() public teamBoard: TeamBoardDetail;

  @Input() public isResetVisible: boolean = true;
  @Input() public isStartVisible: boolean = true;

  private _profile: UserProfile;
  get profile(): UserProfile {
    return this._profile;
  }

  @Input() set profile(value: UserProfile) {
    this._profile = value;
    if (!!this._profile) {
      this.isTeamOwner = this._profile.team.ownerUserId === this._profile.user.id;
    }
  }

  @Output() reset = new EventEmitter();
  @Output() start = new EventEmitter();
  @Output() certificate = new EventEmitter();
  isTeamOwner: boolean = false;  

  constructor(
    private logger: LoggerService,
    private timespanPipe: TimespanPipe) {
    super();
  }

  ngOnInit() {       
  }

  onStart() {
    this.start.emit();
  }

  onDownloadCertificate() {
    this.certificate.emit();
  }

  onReset() {
    this.reset.emit();
  }
}

