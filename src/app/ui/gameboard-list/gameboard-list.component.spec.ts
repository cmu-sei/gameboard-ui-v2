// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameboardListComponent } from './gameboard-list.component';

describe('GameboardListComponent', () => {
  let component: GameboardListComponent;
  let fixture: ComponentFixture<GameboardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameboardListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameboardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

