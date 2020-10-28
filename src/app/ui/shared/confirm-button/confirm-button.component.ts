// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-button',
  templateUrl: './confirm-button.component.html',
  styleUrls: ['./confirm-button.component.scss']
})
export class ConfirmButtonComponent implements OnInit {

  @Input() name: string;
  @Input() classlist: string;
  @Input() disabled: boolean;
  @Output() value = new EventEmitter<boolean>();
  active = false;

  constructor() { }

  ngOnInit() {
  }

  clicked(val: boolean): void {
    if (this.active) {
      this.value.emit(val);
    }
    this.active = !this.active;
  }
}

