// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DocService } from 'src/app/svc/doc.service';

@Component({
  selector: 'app-doc-list',
  templateUrl: './doc-list.component.html',
  styleUrls: ['./doc-list.component.scss']
})
export class DocListComponent implements OnInit {

  @Input() list: Array<string> = [];
  @Output() selected = new EventEmitter<string>();
  current = '';

  constructor(
    private docSvc: DocService
  ) { }

  ngOnInit() {
  }

  onSelected(f: string) {
    this.current = f;
    this.selected.emit(f);
  }
}

