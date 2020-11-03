/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE
MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO
WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING,
BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY,
EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON
UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM
PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see LICENSE.md or contact
permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release
and unlimited distribution.  Please see Copyright notice for non-US Government
use and distribution.

DM20-0284
*/

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { BoardDetail, BoardType, CategoryDetail, ChallengeSpec, CoordinateDetail, GameDetail, QuestionDetail, ActionType, MapDetail } from '../../../models';
import { ChallengeSpecService } from '../../../svc/challenge-spec.service';
import { GameService } from '../../../svc/game.service';
import { BaseComponent } from '../../base.component';
import { DeleteConfirmationSettings } from '../../challenge-developer/detail/detail.component';
import { HomeComponent } from '../../home/home.component';
import { DatePipe } from '@angular/common';
import { LoggerService } from '../../../svc/logger.service';
import { BadgeItem, SettingsService } from '../../../svc/settings.service';
import { UserService } from '../../../svc/user.service';

@Component({
  selector: 'app-game-edit',
  templateUrl: './game-edit.component.html',
  styleUrls: ['./game-edit.component.scss']
})
export class GameEditComponent extends BaseComponent implements OnInit {
  @ViewChild('categoryModal', { static: false }) categoryModal: ModalDirective;
  @ViewChild('mapModal', { static: false }) mapModal: ModalDirective;
  @ViewChild('coordinateModal', { static: false }) coordinateModal: ModalDirective;
  @ViewChild('gameModal', { static: false }) gameModal: ModalDirective;
  @ViewChild('boardModal', { static: false }) boardModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal: ModalDirective;

  game: GameDetail;
  editGame: GameDetail;

  editBoard: BoardDetail;
  boardIndex: number;

  editCategory: CategoryDetail;
  categoryIndex: number;

  editMap: MapDetail;
  mapIndex: number;

  editCoordinate: CoordinateDetail;
  coordinateIndex: number;
  isEditingCoordinate: boolean = false;

  challenges: ChallengeSpec[];

  isDirty: boolean = false;
  isNew: boolean = false;

  startDate: Date;
  startTime: string;

  stopDate: Date;
  stopTime: string;

  enrollmentEndsAtDate: Date;
  enrollmentEndsAtTime: string;

  badges: BadgeItem[];
  availableBadges: string[];
  requiredBadges: string[];
  isGameDesigner = false;

  delete: DeleteConfirmationSettings = {
    title: '',
    text: '',
    type: '',
    data: null
  };

  constructor(
    public main: HomeComponent,
    public gameService: GameService,
    public challengeSpecService: ChallengeSpecService,
    private router: Router,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private logger: LoggerService,
    private config: SettingsService,
    private userSvc: UserService) {
    super();
    this.badges = config.settings.badge.items;
  }

  ngOnInit() {
    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.isGameDesigner = profile && profile.user.isGameDesigner;

        if (!(this.isGameDesigner)) {
          this.router.navigate(['/']);
        }

      }, err => this.main.error(err)));

    this.loadChallenges();

    this.route.params.subscribe(
      (params: Params) => {
        const id = params.id;

        if (id) {
          this.subs.push(this.gameService.get(id).subscribe(result => this.initObject(result)));
        }
        else {
          this.isNew = true;
          this.initObject({ boards: [] });
        }
      }
    );
  }

  initObject(game: GameDetail) {
    game.enrollmentEndsAt = this.formatDate(game.enrollmentEndsAt);
    game.startTime = this.formatDate(game.startTime);
    game.stopTime = this.formatDate(game.stopTime);

    game.boards.forEach(b => {
      b.startTime = this.formatDate(b.startTime);
      b.stopTime = this.formatDate(b.stopTime);
    });

    this.game = game;
  }

  loadChallenges() {
    this.subs.push(this.challengeSpecService.loadAll(null).subscribe(result => this.challenges = result.results));
  }

  validate(): boolean {
    let valid: boolean = true;

    if (!this.game.id || this.game.id.trim() == '')
      valid = false;

    if (!this.game.name || this.game.name.trim() == '')
      valid = false;

    return valid;
  }

  onSave() {
    if (this.validate()) {
      let request: Observable<GameDetail>;
      if (this.isNew) {
        request = this.gameService.create(this.game);
      }
      else {
        request = this.gameService.update(this.game.id, this.game);
      }

      this.subs.push(request.subscribe(result => {        
        this.isNew = false;
        this.isDirty = false;
        this.main.success('Game "' + this.game.id + '" was saved successfully.');
        this.initObject(result);
      }, e => this.main.error(e)));
    }
    else {
      this.main.warning('Game is invalid.');
    }
  }

  onEditGame(): void {
    this.editGame = this.deepCopy(this.game);

    this.startDate = this.editGame.startTime;
    this.startTime = this.startDate ? this.datePipe.transform(this.startDate, 'h:mma') : null;

    this.stopDate = this.editGame.stopTime;
    this.stopTime = this.stopDate ? this.datePipe.transform(this.stopDate, 'h:mma') : null;

    this.enrollmentEndsAtDate = this.editGame.enrollmentEndsAt;
    this.enrollmentEndsAtTime = this.enrollmentEndsAtDate ? this.datePipe.transform(this.enrollmentEndsAtDate, 'h:mma') : null;    

    this.gameModal.show();
  }

  onCopyGame(): void {

  }

  toDate(date: Date, time: string): Date | undefined {
    let result: Date | undefined = null;

    if (!time) {
      time = "12:00AM";
    }

    if (!!date) {
      let h: number;
      let m: number;

      let tokens = time.replace(/[^\d:]/g, '').split(':');

      this.logger.log('tokens', tokens);

      if (tokens.length == 1) {
        if (tokens[0].length == 4) {
          // 1200
          h = parseInt(tokens[0].substr(0, 2));
          m = parseInt(tokens[0].substr(2, 2));
        }
        else if (tokens[0].length == 3) {
          // 100
          h = parseInt(tokens[0].substr(0, 1));
          m = parseInt(tokens[0].substr(1, 2));
        }
        else {
          h = parseInt(tokens[0]);
          m = 0;
        }
      }

      if (tokens.length == 2) {
        h = parseInt(tokens[0]);
        m = parseInt(tokens[1]);
      }

      if (time.toLowerCase().indexOf('p') >= 0 && h < 12) {
        h += 12;
      }

      if (time.toLowerCase().indexOf('a') >= 0 && h > 11) {
        h -= 12;
      }

      this.logger.log('h,m', h, m);
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0);
      }
    }

    if (this.isValidDate(result))
      return result;

    return null;
  }

  isValidDate(d: Date): boolean {
    if (Object.prototype.toString.call(d) === "[object Date]") {
      if (isNaN(d.valueOf())) {
        return false;
      } else {
        return true;
      }
    }

    return false;
  }

  onSaveGame(): void {
    this.game.id = this.editGame.id;
    this.game.name = this.editGame.name;    
    this.game.minTeamSize = this.editGame.minTeamSize;
    this.game.maxTeamSize = this.editGame.maxTeamSize;
    this.game.maxConcurrentProblems = this.editGame.maxConcurrentProblems;

    this.game.startTime = this.toDate(this.startDate, this.startTime);
    this.game.stopTime = this.toDate(this.stopDate, this.stopTime);
    this.game.enrollmentEndsAt = this.toDate(this.enrollmentEndsAtDate, this.enrollmentEndsAtTime);

    this.editGame = null;
    this.isDirty = true;
    this.gameModal.hide();
  }

  // board management

  onEditBoard(board: BoardDetail, index: number): void {
    this.editBoard = this.deepCopy(board);

    this.availableBadges = this.editBoard.badges ? this.editBoard.badges.split(' ') : [];
    this.requiredBadges = this.editBoard.requiredBadges ? this.editBoard.requiredBadges.split(' ') : [];

    this.startDate = this.editBoard.startTime;
    this.startTime = this.startDate ? this.datePipe.transform(this.startDate, 'h:mma') : null;

    this.stopDate = this.editBoard.stopTime;
    this.stopTime = this.stopDate ? this.datePipe.transform(this.stopDate, 'h:mma') : null;

    this.boardIndex = index;
    this.boardModal.show();
  }

  onRemoveBoard(index: number): void {
    this.delete.title = 'Delete Board';
    this.delete.text = 'Are you sure you want to delete this board from this game? This cannot be undone through this UI.';
    this.delete.type = 'board';
    this.delete.data = index;
    this.deleteModal.show();
  }

  moveBoard(index: number, direction: number): void {
    let from = this.deepCopy(this.game.boards[index]);
    let to = this.deepCopy(this.game.boards[index + direction]);

    this.game.boards[index] = to;
    this.game.boards[index + direction] = from;
    this.isDirty = true;
  }

  onCopyBoard(board: BoardDetail): void {
    const copy = this.deepCopy(board);

    this.game.boards.push(copy);
  }

  onAddBoard(): void {
    this.game.boards.push({
      boardType: BoardType.Trivia,
      categories: [],
      maps: [],
      maxConcurrentProblems: this.game.maxConcurrentProblems
    });
  }

  onSaveBoard(): void {
    this.editBoard.startTime = this.toDate(this.startDate, this.startTime);
    this.editBoard.stopTime = this.toDate(this.stopDate, this.stopTime);
    this.editBoard.badges = (this.availableBadges && this.availableBadges.length > 0) ? this.availableBadges.join(" ") : "";
    this.editBoard.requiredBadges = (this.requiredBadges && this.requiredBadges.length > 0) ? this.requiredBadges.join(" ") : "";

    this.game.boards[this.boardIndex] = this.editBoard;

    this.editBoard = null;
    this.isDirty = true;
    this.boardModal.hide();
  }

  // category management

  onAddCategory(board: BoardDetail): void {
    let questionCount = 1;

    if (board.categories.length > 0) {
      let category = board.categories[board.categories.length - 1];
      questionCount = category.questions.length;
    }

    let category: CategoryDetail = {
      name: '-',
      questions: []
    };

    for (let i = 0; i < questionCount; i++) {
      this.onAddQuestion(category);
    }

    board.categories.push(category);

    this.isDirty = true;
  }

  moveCategory(board: BoardDetail, index: number, direction: number): void {
    let from = this.deepCopy(board.categories[index]);
    let to = this.deepCopy(board.categories[index + direction]);

    board.categories[index] = to;
    board.categories[index + direction] = from;
    this.isDirty = true;
  }

  onEditCategory(category: CategoryDetail, boardIndex: number, categoryIndex: number): void {
    this.categoryIndex = categoryIndex;
    this.boardIndex = boardIndex;

    this.editCategory = this.deepCopy(category);
    this.categoryModal.show();
  }

  onRemoveCategory(boardIndex: number, categoryIndex: number) {
    this.delete.title = 'Delete Category';
    this.delete.text = 'Are you sure you want to delete this category from this board? This cannot be undone through this UI.';
    this.delete.type = 'category';
    this.delete.data = { boardIndex: boardIndex, categoryIndex: categoryIndex };
    this.deleteModal.show();
  }

  onSaveCategory(): void {
    this.game.boards[this.boardIndex].categories[this.categoryIndex] = this.deepCopy(this.editCategory);

    this.editCategory = null;
    this.boardIndex = null;
    this.categoryIndex = null;

    this.categoryModal.hide();

    this.isDirty = true;
  }

  // question management

  onAddQuestion(category: CategoryDetail): void {
    let question: QuestionDetail = {
      points: 0,
      challengeLink: {
        slug: '',
        id: ''
      }
    };

    category.questions.push(question);

    this.isDirty = true;
  }

  onRemoveQuestion(category: CategoryDetail, index: number): void {
    category.questions.splice(index, 1);
  }

  // map management

  moveMap(board: BoardDetail, index: number, direction: number): void {
    let from = this.deepCopy(board.maps[index]);
    let to = this.deepCopy(board.maps[index + direction]);

    board.maps[index] = to;
    board.maps[index + direction] = from;
    this.isDirty = true;
  }

  onEditMap(map: MapDetail, boardIndex: number, mapIndex: number): void {
    this.boardIndex = boardIndex;
    this.mapIndex = mapIndex;

    this.editMap = this.deepCopy(map);
    this.mapModal.show();
  }

  onRemoveMap(boardIndex: number, mapIndex: number): void {
    this.delete.title = 'Delete Map';
    this.delete.text = 'Are you sure you want to delete this map from this board? This cannot be undone through this UI.';
    this.delete.type = 'map';
    this.delete.data = { boardIndex: boardIndex, mapIndex: mapIndex };
    this.deleteModal.show();
  }

  onAddMap(board: BoardDetail): void {
    const id = Guid.newGuid();

    board.maps.push({
      id: id,
      name: id,
      imageUrl: '//via.placeholder.com/1000',
      coordinates: [],
      isNew: true
    });

    this.isDirty = true;
  }

  onSaveMap(): void {
    if (this.mapIndex || this.mapIndex === 0) {
      this.game.boards[this.boardIndex].maps[this.mapIndex] = this.deepCopy(this.editMap);
    }
    else {
      this.game.boards[this.boardIndex].maps.push(this.deepCopy(this.editMap));
    }

    this.boardIndex = null;
    this.mapIndex = null;

    this.mapModal.hide();

    this.isDirty = true;
  }

  // coordinate management

  onEditCoordinate(coordinate: CoordinateDetail, boardIndex: number, mapIndex: number): void {
    this.isEditingCoordinate = true;

    this.boardIndex = boardIndex;
    this.mapIndex = mapIndex;

    let coordinateIndex = this.game.boards[this.boardIndex].maps[this.mapIndex].coordinates.indexOf(coordinate);

    this.coordinateIndex = coordinateIndex;

    this.editCoordinate = this.deepCopy(coordinate);
    this.coordinateModal.show();
  }

  onAddCoordinate(e: MouseEvent, boardIndex: number, mapIndex: number): void {
    if (this.isEditingCoordinate) {
      // prevent bubbled click event
      this.isEditingCoordinate = false;
    }
    else {
      this.boardIndex = boardIndex;
      this.mapIndex = mapIndex;
      this.coordinateIndex = null;

      const image = e.target as SVGImageElement;

      const dim = image.getBoundingClientRect();
      const px = e.clientX - dim.left;
      const py = e.clientY - dim.top;

      const x = px / dim.width * 100;
      const y = py / dim.height * 100;

      this.editCoordinate = {
        x: x,
        y: y,
        actionType: ActionType.Challenge,
        radius: 2,
        isNew: true,
        challengeLink: { id: '', slug: '' }
      };

      this.coordinateModal.show();
    }
  }

  onRemoveCoordinate(): void {
    this.game.boards[this.boardIndex].maps[this.mapIndex].coordinates.splice(this.coordinateIndex, 1);

    this.editCoordinate = null;
    this.boardIndex = null;
    this.mapIndex = null;
    this.coordinateIndex = null;

    this.coordinateModal.hide();

    this.isDirty = true;
  }

  onSaveCoordinate(): void {
    if (this.coordinateIndex || this.coordinateIndex === 0) {
      this.game.boards[this.boardIndex].maps[this.mapIndex].coordinates[this.coordinateIndex] = this.deepCopy(this.editCoordinate);
    }
    else {
      this.game.boards[this.boardIndex].maps[this.mapIndex].coordinates.push(this.deepCopy(this.editCoordinate));
    }

    this.editCoordinate = null;
    this.boardIndex = null;
    this.mapIndex = null;
    this.coordinateIndex = null;

    this.coordinateModal.hide();

    this.isDirty = true;
  }

  // delete confirmation by config

  onDeleteConfirm(): void {
    this.deleteModal.hide();

    switch (this.delete.type) {
      case 'board':
        this.game.boards.splice(this.delete.data, 1);
        this.isDirty = true;
        break;
      case 'category':
        this.game.boards[this.delete.data.boardIndex].categories.splice(this.delete.data.categoryIndex, 1);
        this.isDirty = true;
        break;
      case 'map':
        this.game.boards[this.delete.data.boardIndex].maps.splice(this.delete.data.mapIndex, 1);
        this.isDirty = true;
        break;
      default:
        this.main.warning('Could not confirm delete for ' + this.delete.type);
        break;
    }
  }

  toggleAvailableBadge(badge: string): void {
    if (this.availableBadges) {
      if (this.availableBadges.indexOf(badge) === -1) {
        this.availableBadges.push(badge);
      }
      else {
        const index = this.availableBadges.indexOf(badge, 0);
        if (index > -1) {
          this.availableBadges.splice(index, 1);
        }
      }
    }

    return;
  }

  toggleRequiredBadge(badge: string): void {
    if (this.requiredBadges) {
      if (this.requiredBadges.indexOf(badge) === -1) {
        this.requiredBadges.push(badge);
      }
      else {
        const index = this.requiredBadges.indexOf(badge, 0);
        if (index > -1) {
          this.requiredBadges.splice(index, 1);
        }
      }
    }

    return;
  }

  hasAvailableBadge(badge: string): boolean {
    if (this.availableBadges && this.availableBadges.length > 0) {
      return this.availableBadges.indexOf(badge) !== -1;
    }

    return false;
  }

  hasRequiredBadge(badge: string): boolean {
    if (this.requiredBadges && this.requiredBadges.length > 0) {
      return this.requiredBadges.indexOf(badge) !== -1;
    }

    return false;
  }
}

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

