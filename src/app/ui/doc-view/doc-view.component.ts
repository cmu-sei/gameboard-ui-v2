/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

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

