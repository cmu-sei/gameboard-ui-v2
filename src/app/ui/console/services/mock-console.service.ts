/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Injectable } from '@angular/core';
import { ConsoleService } from './console.service';

@Injectable()
export class MockConsoleService implements ConsoleService {
  counter = 0;
  stateChanged: (state: string) => void;

  constructor() { }

  connect(url: string, stateCallback: (state: string) => void, options: any) {
    if (stateCallback === Function) { this.stateChanged = stateCallback; }
    if (this.counter % 3 === 2) {
      stateCallback('connected');
      setTimeout(() => {
        stateCallback('disconnected');
      }, 10000);
    }

    if (this.counter % 3 === 1) { stateCallback('failed'); }
    if (this.counter % 3 === 0) { stateCallback('forbidden'); }
    this.counter += 1;
  }
  disconnect() {
    this.stateChanged('disconnected');
  }
  sendCAD() {}
  refresh() {}
  toggleScale() {}
  fullscreen() {}
  showKeyboard() {}
  showExtKeypad() {}
  showTrackpad() {}
  copy() {}
  paste() {}
  dispose() {}
}

