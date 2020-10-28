// Copyright 2020 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import {
  Component, OnInit, ViewChild, AfterViewInit,
  ElementRef, Input, Injector, HostListener, OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProblemConsoleDetail, UserProfile } from '../../models';
import { catchError, debounceTime, map, distinctUntilChanged, tap } from 'rxjs/operators';
import { throwError as ObservableThrower, fromEvent, Subscription, timer } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { MockConsoleService } from './services/mock-console.service';
import { WmksConsoleService } from './services/wmks-console.service';
import { ConsoleService } from './services/console.service';
import { ChallengeService } from 'src/app/svc/challenge.service';
import { UserService } from 'src/app/svc/user.service';
import { ClipboardService } from 'src/app/svc/clipboard.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
  providers: [
    MockConsoleService,
    WmksConsoleService
  ]
})
export class ConsoleComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() index = 0;
  @Input() id: string;
  @Input() pid: string;
  @Input() name: string;
  @Input() viewOnly = false;
  info: ProblemConsoleDetail = {};
  problemId: string;
  title: string;
  state = 'loading';
  isConnected = false;
  shadowstate = 'loading';
  shadowTimer: any;
  cliptext = '';
  canvasId = '';
  stateButtonIcons: any = {};
  stateIcon = '';
  showTools = false;
  showClipboard = false;
  showCog = true;
  justClipped = false;
  justPasted = false;
  console: ConsoleService;
  profile: UserProfile;
  @ViewChild('consoleCanvas', null) consoleCanvas: ElementRef;
  subs: Array<Subscription> = [];
  private hotspot = { x: 0, y: 0, w: 8, h: 8 };

  constructor(
    private injector: Injector,
    private route: ActivatedRoute,
    private svc: ChallengeService,
    private profileSvc: UserService,
    private titleSvc: Title,
    private clipSvc: ClipboardService
  ) {
  }

  ngOnInit() {

    this.info.id = this.id || this.route.snapshot.params.id;
    this.problemId = this.pid || this.route.snapshot.params.pid;
    this.title = this.route.snapshot.params.name;

    this.subs.push(

      this.profileSvc.user$.subscribe(
        (profile: UserProfile) => {
          this.profile = profile;
          if (!profile && this.console) {
            this.console.disconnect();
          }
          if (profile && this.info.id) {
            this.reload();
          }
        }
      )
    );

    // this.fullscreen = this.route.snapshot.parent.url.length === 0;

  }

  ngAfterViewInit() {

    this.initHotspot();

    const el = this.consoleCanvas.nativeElement;
    this.canvasId = el.id + this.index;
    el.id += this.index;

    if (!!this.title) {
      this.titleSvc.setTitle(`console: ${this.title}`);
    }
    setTimeout(() => this.reload(), 1);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    if (this.console) { this.console.dispose(); }
  }

  changeState(state: string): void {

    if (state.startsWith('clip:')) {
      this.cliptext = state.substring(5);
      this.clipSvc.copyToClipboard(this.cliptext);
      return;
    }

    this.state = state;
    this.shadowState(state);
    this.isConnected = state === 'connected';

    switch (state) {
      case 'stopped':
        this.stateIcon = 'power-off';
        break;

      case 'disconnected':
        this.stateIcon = 'refresh';
        break;

      case 'forbidden':
        this.stateIcon = 'ban';
        break;

      case 'failed':
        this.stateIcon = 'times';
        break;

      default:
        this.stateIcon = '';
    }
  }

  stateButtonClicked(): void {
    switch (this.state) {
      case 'stopped':
        this.start();
        break;

      default:
        this.reload();
        break;
    }
  }

  reload() {
    if (!this.profile) {
      return;
    }
    this.changeState('loading');

    this.svc.ticket(this.info.id, this.problemId)
      .pipe(
        catchError((err: Error) => {
          return ObservableThrower(err);
        })
      )
      .subscribe(
        (info: ProblemConsoleDetail) => {
          this.info = info;
          this.console = (this.isMock())
            ? this.injector.get(MockConsoleService)
            : this.injector.get(WmksConsoleService);
          if (info.id) {
            if (info.isRunning) {
              this.console.connect(
                this.info.url,
                (state: string) => this.changeState(state),
                { canvasId: this.canvasId, viewOnly: this.viewOnly }
              );
            } else {
              this.changeState('stopped');
            }
          } else {
            this.changeState('failed');
          }
        },
        () => {
          // show error
          this.changeState('failed');
        },
        () => {
        }
      );

  }

  start(): void {
    this.changeState('starting');
    this.svc.vmAction({
        id: this.problemId,
        vmId: this.info.id,
        type: 'start'
      }).subscribe(
      (success: boolean) => this.reload()
    );
  }

  shadowState(state: string): void {
    this.shadowstate = state;
    if (this.shadowTimer) { clearTimeout(this.shadowTimer); }
    this.shadowTimer = setTimeout(() => { this.shadowstate = ''; }, 5000);
  }

  isMock(): boolean {
    return this.info.conditions && this.info.conditions.match(/mock/) !== null;
  }

  showMockConnected(): boolean {
    return this.isMock() && this.state === 'connected';
  }

  showUtilities() {
    this.showTools = !this.showTools;
  }

  enterFullscreen() {
    if (!!this.console) {
      this.console.fullscreen();
      this.showTools = false;
    }
  }

  clip() {
    this.console.copy();
    this.justClipped = true;
    timer(2000).subscribe(i => this.justClipped = false);
  }

  paste() {
    this.console.paste(this.cliptext);
    this.justPasted = true;
    timer(2000).subscribe(i => this.justPasted = false);
  }

  initHotspot(): void {
    // this.hotspot.x = window.innerWidth - this.hotspot.w;
    this.subs.push(
      fromEvent(document, 'mousemove').pipe(
        debounceTime(100),
        tap((e: MouseEvent) => {
          if (this.showTools && e.clientX > 400) {
            this.showTools = false;
          }
        }),
        map((e: MouseEvent) => {
          return this.isConnected && !this.showCog && e.clientX < 4;
        }),
        distinctUntilChanged()
      ).subscribe(hot => {
        if (hot) {
          this.showTools = true;
        }
      })
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // this.hotspot.x = event.target.innerWidth - this.hotspot.w;
    this.console.refresh();
  }
}

