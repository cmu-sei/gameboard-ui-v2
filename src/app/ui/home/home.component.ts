/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SnackbarService } from 'ngx-snackbar';
import { BoardDetail, SystemMessage, SnackbarMessage, UserProfile, GameDetail, TeamDetail } from '../../models';
import { AuthService, AuthToken, AuthTokenState } from '../../svc/auth.service';
import { DocService } from '../../svc/doc.service';
import { BoardService } from '../../svc/board.service';
import { MessageService } from '../../svc/message.service';
import { NotificationService } from '../../svc/notification.service';
import { SettingsService, SidebarSettings, HeaderSettings, ApiStatus, StatusDetail } from '../../svc/settings.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { LoggerService } from '../../svc/logger.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponent implements OnInit {
  @ViewChild('ieModal', { static: false }) ieModal: ModalDirective;
  authState: AuthToken;
  title = 'Gameboard';
  subtitle = 'A gameboard for quiz challenges';
  docs = new Array<string>();
  isIE = false;
  isModalShown = false;
  connectionError = false;
  boards: BoardDetail[];
  profile: UserProfile;
  status: StatusDetail;
  sidebar: SidebarSettings = {
    logo: { url: '', alt: '', style: {} }
  };

  header: HeaderSettings = {
    logo: { url: '', alt: '', style: {} },
    message: { primaryText: '', secondaryText: '', icon: '' }
  };

  messages: SnackbarMessage[] = [];

  constructor(
    private authSvc: AuthService,
    private settingsSvc: SettingsService,
    private docSvc: DocService,
    private router: Router,
    private route: ActivatedRoute,
    private notifier: NotificationService,
    private msgSvc: MessageService,
    private gameboardService: BoardService,
    private userService: UserService,
    private snackbarService: SnackbarService,
    private logger: LoggerService
  ) {
    super();

    this.sidebar = settingsSvc.settings.branding.sidebar;
    this.header = settingsSvc.settings.branding.header;
  }

  public error(err: any) {
    const message: SystemMessage = { type: 'error' };

    message.value = err.error ? err.error.message || err.error.Message : err.message || err.Message;
    message.key = message.value;

    this.addMessage(message);
  }

  public success(value: string, key?: string) {
    this.addMessage({ type: 'success', value: value, key: key });
  }

  public warning(value: string, key?: string) {
    this.addMessage({ type: 'warning', value: value, key: key });
  }

  public info(value: string, key?: string) {
    this.addMessage({ type: 'info', value: value, key: key });
  }

  private background(type: string): string {
    if (type === 'error') { return '#A41E25'; }
    if (type === 'success') { return '#41AD57'; }
    if (type === 'warning') { return '#F39C12'; }
    if (type === 'info') { return '#3498DB'; }
    return '#343434';
  }

  private color(type: string): string {
    if (type === 'error') { return '#FFFFFF'; }
    if (type === 'success') { return '#FFFFFF'; }
    if (type === 'warning') { return '#FFFFFF'; }
    if (type === 'info') { return '#FFFFFF'; }
    return 'auto';
  }

  private prefix(type: string): string {
    if (type === 'error') { return '<i class="fa fa-ban fa-lg"></i> '; }
    if (type === 'success') { return '<i class="fa fa-check-circle fa-lg"></i> '; }
    if (type === 'warning') { return '<i class="fa fa-exclamation-circle fa-lg"></i> '; }
    if (type === 'info') { return '<i class="fa fa-info-circle fa-lg"></i> '; }
    return '';
  }

  private addMessage(message: SystemMessage) {

    if (message && message.type && message.value) {

      let add: boolean = true;
      if (message.key) {
        // if message defines a key we don't want to display duplicates if still visible
        add = this.messages.find(x => x.message.key == message.key) == null;
      }

      if (add) {
        const color: string = this.color(message.type);
        const background: string = this.background(message.type);
        const prefix: string = this.prefix(message.type);

        let data: any = {
          msg: prefix + message.value,
          color,
          background,
          action: {
            text: '✔',
            color,
            onClick: (snack) => { },
          },
          onAdd: (snack) => {
            this.messages.push({ message: message, data: snack });
          },
          onRemove: (snack) => {
            let message = this.messages.find(x => x.data == snack);
            let index = this.messages.indexOf(message);
            this.messages.splice(index, 1);
          }
        };

        this.snackbarService.add(data);
      }
      else {
        this.logger.log('message key \'' + message.key + '\' has already been added');
      }

    } else {
      this.logger.log('invalid message');
    }
  }

  ngOnInit() {
    this.isIE = /msie\s|trident\//i.test(window.navigator.userAgent);

    if (this.isIE) {
      this.isModalShown = true;
    }

    this.title = this.settingsSvc.settings.applicationName;
    this.subtitle = this.settingsSvc.settings.applicationBlurb;

    this.loadBoards();

    this.subs.push(this.msgSvc.listen().subscribe((m: SystemMessage) => {
      this.addMessage(m);
    }));

    this.subs.push(this.settingsSvc.status().subscribe((s: StatusDetail) => {
      this.status = s;
    }));

    this.subs.push(this.docSvc.toc().subscribe(
      list => {
        this.docs = list;
        if (list.length > 0 && this.route.children.length === 0) {
          this.loadDoc(list[0]);
        }
      }, e => this.error(e)
    ));

    this.subs.push(this.authSvc.tokenState$.subscribe(
      state => {
        this.authState = state;
        if (state.state === AuthTokenState.expired) {
          this.router.navigate(['/']);
        }
      }, e => this.error(e)
    ));    

    this.subs.push(this.userService.user$.subscribe(
      (profile: UserProfile) => {
        this.profile = profile;
        this.loadBoards();
      }
    ));

    this.subscribeNotifications();
  }

  subscribeNotifications() {
    this.subs.push(this.notifier.connected$.subscribe(
      (success) => {
        this.connectionError = !success;
      }
    ));

    this.subs.push(this.notifier.systemMessage$.subscribe(
      (message: string) => {
        this.success(message);
      }, err => this.error(err)
    ));

    this.subs.push(this.notifier.teamUpdates$.subscribe(
      (team: TeamDetail) => {
        this.profile.team = team;
        this.loadBoards();
      },
      err => this.error(err)
    ));

    this.subs.push(this.notifier.gameUpdated$.subscribe(
      (game: GameDetail) => {
        this.boards = game.boards;
        this.initBoards();
      }, err => this.error(err)
    ));
  }

  loadDoc(id: string) {
    this.router.navigate(['doc', id]);
  }

  showModal(): void {
    this.isModalShown = true;
  }

  hideModal(): void {
    this.ieModal.hide();
  }

  onHidden(): void {
    this.isModalShown = false;
  }

  loadBoards() {

    this.subs.push(this.gameboardService.list().subscribe(
      data => {
        this.boards = data;
        this.initBoards();
      }, err => this.error(err)
    ));
  }

  initBoards() {
    this.boards.forEach(b => this.gameboardService.updateBoardState(b));
  }
}

