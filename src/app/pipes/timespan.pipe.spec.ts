// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { TimespanPipe } from './timespan.pipe';

describe('TimespanPipe', () => {
  it('create an instance', () => {
    const pipe = new TimespanPipe();
    expect(pipe).toBeTruthy();
  });
});

