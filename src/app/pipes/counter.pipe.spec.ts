// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { CounterPipe } from './counter.pipe';

describe('CounterPipe', () => {
  it('create an instance', () => {
    const pipe = new CounterPipe();
    expect(pipe).toBeTruthy();
  });
});

