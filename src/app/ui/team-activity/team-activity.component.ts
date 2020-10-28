/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BoardDetail, BoardTimes, BoardType, CategoryDetail, CoordinateDetail, MapDetail, QuestionDetail, TeamActivity, TeamBoardEventDetail, TeamDetail, UserProfile } from '../../models';
import { BoardService } from '../../svc/board.service';
import { MessageService } from '../../svc/message.service';
import { TeamService } from '../../svc/team.service';
import { UserService } from '../../svc/user.service';
import { BaseComponent } from '../base.component';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-team-activity',
  templateUrl: './team-activity.component.html',
  styleUrls: ['./team-activity.component.scss']
})
export class TeamActivityComponent extends BaseComponent implements OnInit {
  profile: UserProfile;
  isModerator = false;
  isObserver = false;
  activity: TeamActivity[];
  team: TeamDetail;
  id: string;
  boardEvents: Array<TeamBoardEventDetail>;
  boards: BoardDetail[] = [];
  boardTimes: BoardTimes[] = [];
  consoles: Array<string> = [];

  constructor(
    private main: HomeComponent,
    private userSvc: UserService,
    private gameboardSvc: BoardService,
    private msgSvc: MessageService,
    private teamSvc: TeamService,
    private router: Router,
    private route: ActivatedRoute
  ) { super(); }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = params.id;
        this.loadUser();
      }
    );
  }

  loadUser() {
    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.profile = profile;
        this.isModerator = profile && profile.user.isModerator;
        this.isObserver = profile && profile.user.isObserver;

        if (!(this.isModerator || this.isObserver)) {
          this.router.navigate(['/']);
        }

        this.loadTeam();

      }, err => this.main.error(err)));
  }

  loadGameboards() {
    this.boards = [];

    this.subs.push(this.gameboardSvc.list().subscribe(result => {
      const boards: BoardDetail[] = result.filter(b => !b.isPractice);

      boards.forEach(b => {
        this.loadGameboard(b.id);
      });
    }));
  }

  loadTeam() {
    this.subs.push(this.teamSvc.load(this.id).subscribe(result => {
      this.team = result;
      this.loadGameboards();
      this.loadTeamActivities();
      this.loadTeamBoardEvents();
    }, err => this.main.error(err)));
  }

  loadGameboard(id: string) {
    this.subs.push(this.gameboardSvc.loadByTeam(id, this.id).subscribe(result => {
      const board: BoardDetail = result;      
      this.boards.push(board);
    }, err => {
      // don't display errors when loading boards that hasn't started yet or don't exist
      // this.main.error(err);
    }));
  }

  loadTeamActivities() {
    this.subs.push(this.teamSvc.loadTeamActivities({ filter: 'id=' + this.id }).subscribe(
      pagedResult => {
        this.activity = pagedResult.results;
      },
      err => { this.msgSvc.error(err); }
    ));
  }

  loadTeamBoardEvents() {
    this.subs.push(this.teamSvc.loadTeamBoardEvents(this.id).subscribe(boards => {
      this.boardEvents = this.teamSvc.generateTeamBoardEvents(boards, this.boardTimes);
    }, err => this.main.error(err)));
  }

  getContainers(board: BoardDetail): any[] {
    if (board.boardType == BoardType.Trivia)
      return board.categories;

    if (board.boardType == BoardType.Map) {
      const maps: MapDetail[] = [];

      // only return maps with challenges
      board.maps.forEach(m => {
        const coordinates = m.coordinates.filter(c => c.challenge);

        if (coordinates.length > 0) {
          maps.push(m);
        }

      });

      return maps;
    }    

    return [];
  }

  getItems(board: BoardDetail, container: CategoryDetail | MapDetail): any[] {
    if (board.boardType == BoardType.Trivia)
      return (container as CategoryDetail).questions.filter(x => x.challenge);

    if (board.boardType == BoardType.Map)
      return (container as MapDetail).coordinates.filter(x => x.challenge);

    return [];
  }

  class(item: QuestionDetail | CoordinateDetail) {
    if (item && item.challenge) {
      const status = !!item.challenge.problemStatus ? item.challenge.problemStatus : 'none';

      switch (status.toLowerCase()) {
        case 'success': return 'success';
        case 'complete': return 'complete';
        case 'failure':
          if (item.challenge.problemScore > 0)
            return 'partial'

          return 'failure'
          break;
        case 'none': return 'pending';
      }
    }

    return 'working';
  }

}

