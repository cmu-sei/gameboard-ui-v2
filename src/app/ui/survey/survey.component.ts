// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input } from '@angular/core';
import { Answer, Question } from '../../models';
import { AuthService } from '../../svc/auth.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.scss']
})
export class SurveyComponent extends BaseComponent implements OnInit {
  @Input() id: string;
  @Input() disabled = false;
  @Input() message: string;
  @Input() hideCompleteButton = false;

  survey: Question[];
  answers: Answer[];
  complete = false;

  constructor(
    private main: HomeComponent,
    private userSvc: UserService,
    private authSvc: AuthService,
    private route: ActivatedRoute
  ) { super(); }

  ngOnInit() {

    this.isComplete();
  }

  isComplete() {
    const method: Observable<boolean> = !!this.id
      ? this.userSvc.isChallengeSurveyComplete(this.id)
      : this.userSvc.isSurveyComplete();

    this.subs.push(method.subscribe(complete => {
      this.complete = complete;
      if (!this.complete) {
        this.load();
      }
    }, err => this.main.error(err)
    ));
  }

  load() {
    const method: Observable<any> = !!this.id
      ? this.userSvc.loadChallengeSurvey()
      : this.userSvc.loadSurvey();

    this.subs.push(method.subscribe(
      survey => {
        const answers: Answer[] = [];
        survey.forEach(s => {
          answers.push({ text: s.text, value: '', type: s.type, error: false });
        });

        this.answers = answers;
        this.survey = survey;
      }, err => this.main.error(err)
    ));
  }

  save() {
    let error = false;

    this.answers.forEach(a => {
      if (a.value === '' && a.type === 'radio') {
        a.error = true;
        error = true;
      } else {
        a.error = false;
      }
    });

    if (!error) {
      debugger
      const method: Observable<boolean> = !!this.id
        ? this.userSvc.sendChallengeSurvey(this.id, this.answers)
        : this.userSvc.sendSurvey(this.answers);

      this.subs.push(method.subscribe(result => {
        window.scroll(0, 0);
        this.complete = result;
      },
        err => this.main.error(err)));
    }
  }
}

