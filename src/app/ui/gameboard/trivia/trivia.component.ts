// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BoardDetail, QuestionDetail, TeamBoardDetail, UserProfile } from '../../../models';
import { BaseComponent } from '../../base.component';

@Component({
  selector: 'app-trivia',
  templateUrl: './trivia.component.html',
  styleUrls: ['./trivia.component.scss']
})
export class TriviaComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() board: BoardDetail;
  @Input() isTestMode: boolean;
  @Input() teamBoard: TeamBoardDetail;
  @Input() profile: UserProfile;
  @Output() selected = new EventEmitter<QuestionDetail>();

  constructor() {
    super();
  }

  ngOnInit() {

  }

  questionStatus(item: QuestionDetail) {
    return (!!item.challenge.problemStatus ? item.challenge.problemStatus : 'none').toLowerCase();
  }

  questionClass(item: QuestionDetail) {

    let value = '';

    if (item.isDisabled) {
      value = 'disabled';
    }
    else {
      const status = this.questionStatus(item);

      switch (status.toLowerCase()) {
        case 'success':
          value = 'success inactive';
          break;
        case 'complete':
          value = 'complete';
          break;
        case 'failure':
          value = 'failure inactive';
          break;
        case 'pending':
          value = 'pending';
          break;
        case 'ready':
          value = 'ready';
          break;
        case 'none':
        default:
          value = '';
          break;
      }
    }

    if (this.board.isTitleVisible) {
      value += ' with-title';
    }

    return value;
  }

  onClick(question: QuestionDetail) {
    this.selected.emit(question);
  }
}

