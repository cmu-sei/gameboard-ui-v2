/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BoardDetail, CoordinateDetail, MapDetail, TeamBoardDetail, UserProfile, ActionType, PageLocation } from '../../../models';
import { SettingsService } from '../../../svc/settings.service';
import { BaseComponent } from '../../base.component';
import { LoggerService } from '../../../svc/logger.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent extends BaseComponent implements OnInit, OnDestroy {

  @Input() board: BoardDetail;
  @Input() isTooltipVisible = true;
  @Input() isTestMode: boolean;
  @Input() teamBoard: TeamBoardDetail;
  @Input() profile: UserProfile;
  @Input() showGrid = false;  
  @Input() map: MapDetail;

  @Output() selected = new EventEmitter<CoordinateDetail>();

  tooltip: any;
  hovered: CoordinateDetail;

  isFirefox: boolean = false;

  constructor(
    private config: SettingsService,
    private logger: LoggerService) {
    super();

    this.isFirefox = navigator.userAgent.indexOf("Firefox") != -1;
  }

  ngOnInit() {    
  }

  getPageLocation(event: MouseEvent): PageLocation {
    if (this.isFirefox) {
      return { x: event.clientX, y: event.clientY, factorX: 825, factorY: 425 };
    }

    // chrome, ie, edge
    return { x: event.offsetX, y: event.offsetY, factorX: 350, factorY: 175 };
  }

  showTooltip(event: MouseEvent, coordinate: CoordinateDetail): void {
    if (!this.isTooltipVisible ||
      this.hovered === coordinate ||
      coordinate.actionType !== ActionType.Challenge ||
      !coordinate.challenge ||
      !coordinate.challenge.id) {
      return;
    }

    this.hovered = coordinate;

    if (!this.tooltip) {
      this.tooltip = document.getElementById('tooltip');
    }
    
    const location = this.getPageLocation(event);

    const left = (location.x - location.factorX) + 'px';
    const top = (location.y - location.factorY) + 'px';
        
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = left;
    this.tooltip.style.top = top;
  }

  hideTooltip(): void {
    if (this.tooltip && this.isTooltipVisible) {
      this.tooltip.style.display = 'none';
      this.hovered = null;
    }
  }

  onClick(coordinate: CoordinateDetail) {
    this.selected.emit(coordinate);
  }

  getCoordinateClass(c: CoordinateDetail): string {
    if (c.challenge && c.challenge.problemStatus) {
      return 'coordinate ' + c.challenge.problemStatus.toLowerCase();
    }

    return 'coordinate';
  }
}

