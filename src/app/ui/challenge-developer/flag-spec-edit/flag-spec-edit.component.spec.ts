// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlagSpecEditComponent } from './flag-spec-edit.component';

describe('FlagSpecEditComponent', () => {
  let component: FlagSpecEditComponent;
  let fixture: ComponentFixture<FlagSpecEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlagSpecEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlagSpecEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

