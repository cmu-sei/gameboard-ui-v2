// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmSpecEditComponent } from './vm-spec-edit.component';

describe('VmSpecEditComponent', () => {
  let component: VmSpecEditComponent;
  let fixture: ComponentFixture<VmSpecEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VmSpecEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmSpecEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

