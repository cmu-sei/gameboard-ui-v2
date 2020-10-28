// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocListComponent } from './doc-list.component';

describe('DocListComponent', () => {
  let component: DocListComponent;
  let fixture: ComponentFixture<DocListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

