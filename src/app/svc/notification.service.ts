/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { HubConnection, HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from '@aspnet/signalr';
import { SettingsService } from './settings.service';
import { MemberPresence, PresenceEvent, TeamDetail, UserProfile, LeaderboardUpdated, ProblemDetail, Leaderboard, GameDetail } from '../models';
import { Subject, Observable, BehaviorSubject, timer } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  channelId: string;
  connection: HubConnection;
  profile: UserProfile;
  me: MemberPresence;
  members: Array<MemberPresence> = [];
  members$ = new BehaviorSubject<Array<MemberPresence>>(this.members);

  connected$ = new Subject<boolean>();

  private problemSource: Subject<ProblemDetail> = new Subject<ProblemDetail>();
  problem$: Observable<ProblemDetail> = this.problemSource.asObservable();

  private teamSource: Subject<TeamDetail> = new Subject<TeamDetail>();
  teamUpdates$: Observable<TeamDetail> = this.teamSource.asObservable();

  private boardSource: Subject<TeamDetail> = new Subject<TeamDetail>();
  boardReset$: Observable<TeamDetail> = this.boardSource.asObservable();

  private systemMessageSource: Subject<string> = new Subject<string>();
  systemMessage$: Observable<string> = this.systemMessageSource.asObservable();

  private leaderboardSource: Subject<Leaderboard> = new Subject<Leaderboard>();
  leaderboardUpdated$: Observable<Leaderboard> = this.leaderboardSource.asObservable();

  private gameSource: Subject<GameDetail> = new Subject<GameDetail>();
  gameUpdated$: Observable<GameDetail> = this.gameSource.asObservable();

  constructor(
    private userSvc: UserService,
    private config: SettingsService,
    private logger: LoggerService
  ) {
    userSvc.user$.subscribe(
      (profile) => {
        this.profile = profile;
        if (profile && profile.user && profile.user.teamId) {

          if (profile.user.teamId !== this.channelId) {

            this.channelId = profile.user.teamId;
            this.me = {
              id: profile.user.id,
              name: profile.user.name,
              teamId: profile.user.teamId,
              picture: profile.claims.picture,
              picture_o: profile.claims.picture_o,
              picture_ou: profile.claims.picture_ou,
              online: true,
              self: true,
              eventType: PresenceEvent.arrival
            };

            this.restart();
            // this.buildConnection().then(() => this.trystart());
          }
        } else {
          this.channelId = '';
          this.stop();
        }
      }
    );
  }

  private restart(): void {
    // if (this.connected) {
        this.stop().then(
            () => {
                // this.log('sigr: leave/stop complete. starting');
                if (this.channelId) {
                    this.start(this.channelId);
                }
            }
        );
    // }
  }

  start (key: string): void {

      this.userSvc.getTicket().pipe(
      ).subscribe(
        model => {
          this._start(key, model.ticket);
        },
        err => {
          this.connected$.next(false);
          timer(2000).subscribe(() => this.restart());
        });
  }

  _start(key: string, ticket: string): Promise<void> {

    this.connection = new HubConnectionBuilder()
      .withUrl(`${this.config.settings.coreUrl}/hub`, {
        accessTokenFactory: () => ticket,
        transport: HttpTransportType.WebSockets,
        skipNegotiation: true
      })
      .configureLogging(LogLevel.Warning)
      .build();

    return this.connection.start()
    .catch(err => {
      console.error(err);
      this.connected$.next(false);
      timer(2000).subscribe(() => this.restart());
    })
    .then(() => {

      this.connection.onclose(
        (error: Error) => {
          timer(2000).subscribe(() => this.restart());
        }
      );

      this.connection.on('problemUpdated',
        (problemDetail) => {
          this.problemSource.next(problemDetail);
        }
      );

      this.connection.on('presenceUpdated',
        (presence: MemberPresence) => {
          if (presence.eventType === PresenceEvent.arrival) {
            this.connection.invoke('Greet', this.me).then();
          }
          if (presence.eventType === PresenceEvent.kicked) {
            this.kickMember(presence);
          } else {
            this.setMember(presence);
          }
        }
      );

      this.connection.on('teamUpdated',
        (team: TeamDetail) => {
          this.teamSource.next(team);
        }
      );

      this.connection.on('boardReset',
        (team: TeamDetail) => {
          this.boardSource.next(team);
        }
      );

      this.connection.on('systemMessage',
        (message: string) => {
          this.systemMessageSource.next(message);
        }
      );

      this.connection.on('leaderboardUpdated',
        (leaderboard: Leaderboard) => {
          this.leaderboardSource.next(leaderboard);
        }
      );

      this.connection.on('gameUpdated',
        (game: GameDetail) => {
          this.gameSource.next(game);
        }
      );

      this.connection.invoke('Listen', this.me).then(
        () => {
          this.logger.log('sigr: invoked Listen');
          this.setMember(this.me);
        }
      );

      this.connected$.next(true);

    });
  }

  stop(): Promise<void> {
    if (!this.connection || this.connection.state === HubConnectionState.Disconnected) {
      return Promise.resolve();
    }

    this.connection.stop();
    this.connection = null;
    this.me = null;
    this.members = [];
    this.members$.next(this.members);

    return Promise.resolve();

  }

  private setMember(presence: MemberPresence): void {
    presence.online = (presence.eventType === PresenceEvent.arrival || presence.eventType === PresenceEvent.greeting);
    const member = this.members.find(a => a.id === presence.id);

    if (member) {
      member.online = presence.online;
    } else {
      if (presence.id && presence.name) {
        this.members.push(presence);
      }
    }

    this.members$.next(this.members);
  }

  private kickMember(presence: MemberPresence) {
    const member = this.members.find(a => a.id === presence.id);
    if (member) {
      this.members.splice(this.members.indexOf(member), 1);
      this.members$.next(this.members);
      if (member.self) {
        this.me = null;
        this.userSvc.reload();
      }
    }
  }

  mergeMembers(members: Array<MemberPresence>) {
    members.forEach(m => {
      const target = this.members.find(o => o.id === m.id);
      if (!target) {
        this.members.push(m);
      }
    });
  }
}

