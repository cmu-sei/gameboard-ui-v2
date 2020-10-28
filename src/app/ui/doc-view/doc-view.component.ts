// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from 'src/app/svc/settings.service';
import { DocService } from 'src/app/svc/doc.service';
import { interval, Subscription } from 'rxjs';
import { MarkdownService } from 'ngx-markdown';

@Component({
  selector: 'app-doc-view',
  templateUrl: './doc-view.component.html',
  styleUrls: ['./doc-view.component.scss']
})
export class DocViewComponent implements OnInit, OnDestroy {

  url: string;
  doc: string;
  tag: string;
  id: string;
  data: string;
  subs: Array<Subscription> = [];

  constructor(
    private route: ActivatedRoute,
    private config: SettingsService,
    private docSvc: DocService,
    private mdSvc: MarkdownService
  ) {
    this.tag = '?t=' + new Date().valueOf();
    this.url = config.settings.docUrl + '/';
    if (!this.url.endsWith('/')) {
      this.url += '/';
    }
    this.mdSvc.options.baseUrl = this.url;
  }

  ngOnInit() {

    this.subs.push(
      this.route.params.subscribe(p => {
        this.id = p.id;
        this.show();
      }),

      this.docSvc.loaded$.subscribe(
        v => {
          if (v) { this.show(); }
        }
      )
    );
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  show() {
    const path = this.docSvc.lookup(this.id);
    if (path) {
      this.doc = this.url + path + this.tag;
    }
  }

  onLoad(e) {
    // console.log(e);
  }

  onError(e) {
    // console.log(e);
  }
}

