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
import { ChallengeSpec, FlagSpec, FlagStyle, FlagType, WorkspaceSpec } from 'src/app/models';
import { ChallengeSpecService } from 'src/app/svc/challenge-spec.service';
import YAML from 'yaml';
import { BaseComponent } from '../../base.component';
import { HomeComponent } from '../../home/home.component';
import { UserService } from '../../../svc/user.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class ChallengeDeveloperDetailComponent extends BaseComponent implements OnInit {
  @ViewChild('workspaceModal', { static: false }) workspaceModal: ModalDirective;
  @ViewChild('challengeModal', { static: false }) challengeModal: ModalDirective;
  @ViewChild('flagModal', { static: false }) flagModal: ModalDirective;
  @ViewChild('uploadModal', { static: false }) uploadModal: ModalDirective;
  @ViewChild('downloadModal', { static: false }) downloadModal: ModalDirective;
  @ViewChild('deleteModal', { static: false }) deleteModal: ModalDirective;
  @ViewChild('warningsModal', { static: false }) warningsModal: ModalDirective;

  challenge: ChallengeSpec | undefined;
  workspace: WorkspaceSpec | undefined;

  flagIndex: number;
  isChallengeDeveloper = false;

  editChallenge: ChallengeSpec | undefined;
  editWorkspace: WorkspaceSpec | undefined;
  editFlag: FlagSpec | undefined;

  workspaceType: string = '';

  download: string = '';
  upload: string = '';
  isNew: boolean = true;
  isDirty: boolean = false;
  warnings: string[] = [];

  delete: DeleteConfirmationSettings = {
    title: '',
    text: '',
    type: '',
    data: null
  };

  private colors: string[] = [
    '#E6E6FA',
    '#708090',
    '#1E90FF',
    '#2E8B57',
    '#DAA520',
    '#B22222',
    '#C0FF3E',
    '#FF6A6A',
    '#FF34B3'
  ]

  constructor(
    private main: HomeComponent,
    private challengeSpecService: ChallengeSpecService,
    private router: Router,
    private route: ActivatedRoute,
    private userSvc: UserService) {
    super();
  }

  ngOnInit() {
    this.subs.push(this.userSvc.user$.subscribe(
      profile => {
        this.isChallengeDeveloper = profile && profile.user.isChallengeDeveloper;

        if (!(this.isChallengeDeveloper)) {
          this.router.navigate(['/']);
        }

      }, err => this.main.error(err)));

    this.route.params.subscribe(
      (params: Params) => {
        const slug = params.slug;

        if (slug) {
          this.isNew = false;
          this.subs.push(this.challengeSpecService.load(slug).subscribe(challenge => {
            this.challenge = challenge;
            this.analyze();
          }));
        }
        else {
          this.isNew = true;
          setTimeout(() => this.onEditChallenge(), 1000);
        }
      }
    );
  }

  analyze(): void
  {
    const warnings: string[] = [];

    if (!this.challenge.title) { warnings.push('Challenge has no title'); }
    if (!this.challenge.description) { warnings.push('Challenge has no description'); }
    if (!this.challenge.text) { warnings.push('Challenge has no text'); }

    if (!!this.challenge.flags && this.challenge.flags.length > 0) {
      let tokenCounts: number[] = [];
      this.challenge.flags.forEach((f, i) => {
        if (!f.type) { warnings.push('Flag ' + (i + 1) + ' has no type'); }
        if (!f.value) { warnings.push('Flag ' + (i + 1) + ' has no value'); }

        if (!!f.tokens && f.tokens.length > 0) {
          tokenCounts.push(f.tokens.length);
          let totalPercent: number = 0;
          f.tokens.forEach((t, ti) => {
            if (!t.label) { warnings.push('Flag ' + (i + 1) + ', Token ' + (ti + 1) + ' has no label'); }
            if (!t.value) { warnings.push('Flag ' + (i + 1) + ', Token ' + (ti + 1) + ' has no value'); }
            if (!t.percent) { warnings.push('Flag ' + (i + 1) + ', Token ' + (ti + 1) + ' has no percent'); }
            totalPercent += t.percent;
          });

          if (this.challenge.isMultiStage && f.tokens.length == 1) {
            warnings.push('Flag ' + (i + 1) + ' has 1 token but challenge is multi stage');
          }

          if (totalPercent != 100) { warnings.push('Flag ' + (i + 1) + ' tokens do not equal 100%'); }
        }
        else {
          warnings.push('Flag ' + (i + 1) + ' has no tokens');
        }

        if (tokenCounts.length > 0) {
          let count = tokenCounts[0];
          tokenCounts.forEach(c => {
            if (count != c) {
              warnings.push('Flag ' + (i + 1) + ' has invalid number of tokens');
            }
          });
        }
      });
    }
    else {
      warnings.push('Challenge has no flags');
    }

    this.warnings = warnings;
  }

  // CHALLENGE
  onEditChallenge(): void {
    this.editChallenge = this.challenge
      ? this.deepCopy(this.challenge)
      : { flags: [], flagStyle: FlagStyle.Token, workspace: null };

    this.challengeModal.show();
  }

  onSaveChallenge(): void {
    let challenge = this.deepCopy(this.editChallenge);
    this.challenge = challenge;
    this.challengeModal.hide();
    this.isDirty = true;
  }

  validate(): boolean {
    let isValid: boolean = true;

    if (!this.challenge.slug) {
      isValid = false;
      this.main.warning('challenge slug is required.');
    }

    if (!this.challenge.title) {
      isValid = false;
      this.main.warning('challenge title is required.');
    }

    if (!this.challenge.text) {
      isValid = false;
      this.main.warning('challenge text is required.');
    }

    if (!this.challenge.description) {
      isValid = false;
      this.main.warning('challenge description is required.');
    }

    return isValid;
  }

  onSave(): void {
    if (this.validate()) {
      const request = this.isNew
        ? this.challengeSpecService.add(this.challenge)
        : this.challengeSpecService.update(this.challenge.slug, this.challenge);

      this.subs.push(
        request.subscribe(challenge => {
          this.challenge = challenge;
          this.isNew = false;
          this.isDirty = false;
          this.main.success('Challenge "' + this.challenge.slug + '" was saved successfully.');
        })
      );
    }
  }

  // WORKSPACE
  onEditChallengeWorkspace(): void {
    this.editWorkspace = this.deepCopy(this.challenge.workspace);
    this.workspaceType = 'challenge';
    this.workspaceModal.show();
  }

  onAddChallengeWorkspace(): void {
    this.editWorkspace = { vms: [] };
    this.workspaceType = 'challenge';
    this.workspaceModal.show();
  }

  onRemoveChallengeWorkspace(): void {
    this.delete.title = 'Delete Challenge Workspace';
    this.delete.text = 'Are you sure you want to delete the Workspace from this Challenge? This cannot be undone through this UI.';
    this.delete.type = 'challenge-workspace';
    this.delete.data = null;
    this.deleteModal.show();
  }

  onEditFlagWorkspace(flagIndex: number): void {
    this.flagIndex = flagIndex;
    this.editWorkspace = this.deepCopy(this.challenge.flags[flagIndex].workspace);
    this.workspaceType = 'flag';
    this.workspaceModal.show();
  }

  onAddFlagWorkspace(flagIndex: number): void {
    this.flagIndex = flagIndex;
    this.editWorkspace = { vms: [] };
    this.workspaceType = 'flag';
    this.workspaceModal.show();
  }

  onRemoveFlagWorkspace(flagIndex: number): void {

    this.delete.title = 'Delete Flag Workspace';
    this.delete.text = 'Are you sure you want to delete the Workspace from this Flag? This cannot be undone through this UI.';
    this.delete.type = 'flag-workspace';
    this.delete.data = flagIndex;
    this.deleteModal.show();
  }

  onSaveWorkspace(): void {
    let workspace = this.deepCopy(this.editWorkspace);

    if (this.workspaceType == 'challenge') {
      this.challenge.workspace = workspace;
    }

    if (this.workspaceType == 'flag') {
      this.challenge.flags[this.flagIndex].workspace = workspace;
    }

    this.workspaceType = '';
    this.workspaceModal.hide();
    this.isDirty = true;
  }

  // FLAG
  onRemoveFlag(flagIndex: number): void {
    this.delete.title = 'Delete Flag';
    this.delete.text = 'Are you sure you want to delete this Flag? This cannot be undone through this UI.';
    this.delete.type = 'flag';
    this.delete.data = flagIndex;
    this.deleteModal.show();
  }

  onAddFlag(): void {
    this.flagIndex = null;
    this.editFlag = { type: FlagType.Match, files: [], tokens: [{ value: '', percent: 100 }] };
    this.flagModal.show();
  }

  onCopyFlag(flagIndex: number): void {
    this.flagIndex = null;
    this.editFlag = this.deepCopy(this.challenge.flags[flagIndex]);
    this.flagModal.show();
  }

  onEditFlag(flagIndex: number): void {
    this.flagIndex = flagIndex;
    this.editFlag = this.deepCopy(this.challenge.flags[flagIndex]);
    this.flagModal.show();
  }

  onLaunchFlag(flagIndex: number): void {
    //TODO
  }

  onMoveFlag(flagIndex: number, direction: number): void {
    let from = this.deepCopy(this.challenge.flags[flagIndex]);
    let to = this.deepCopy(this.challenge.flags[flagIndex + direction]);

    this.challenge.flags[flagIndex] = to;
    this.challenge.flags[flagIndex + direction] = from;
    this.isDirty = true;
  }

  onSaveFlag(): void {
    if (this.flagIndex == null) {
      this.challenge.flags.push(this.deepCopy(this.editFlag));
    }
    else {
      this.challenge.flags[this.flagIndex] = this.deepCopy(this.editFlag);

    }
    this.flagModal.hide();
    this.isDirty = true;
  }

  onUpload() {
    this.upload = '';
    this.uploadModal.show();
  }

  onUploadSave() {
    let upload: ChallengeSpec = YAML.parse(this.upload);
    this.challenge = upload;
    this.uploadModal.hide();
    this.isDirty = true;
  }

  onDownload() {
    this.download = YAML.stringify(this.challenge);
    this.downloadModal.show();
  }

  getFlagStyle(i: number) {
    let c: number = i;
    if (c > this.colors.length - 1) c = 0;

    return {
      'border-color': this.colors[c]
    };
  }

  onDeleteChallenge(): void {
    this.delete.title = 'Delete Challenge';
    this.delete.text = 'Are you sure you want to delete this Challenge? This cannot be undone through this UI.';
    this.delete.type = 'challenge';
    this.delete.data = this.challenge;
    this.deleteModal.show();
  }

  onDeleteConfirm(): void {
    this.deleteModal.hide();

    switch (this.delete.type) {
      case 'challenge':
        this.subs.push(
          this.challengeSpecService.delete(this.challenge.slug)
            .subscribe((result) => {
              this.main.warning('Challenge has been removed.');
              this.router.navigate(['/challenge-developer']);
            })
        );
        break;
      case 'flag':
        this.challenge.flags.splice(this.delete.data, 1);
        this.isDirty = true;
        break;
      case 'flag-workspace':
        this.challenge.flags[this.delete.data].workspace = null;
        this.isDirty = true;
        break;
      case 'challenge-workspace':
        this.challenge.workspace = null;
        this.isDirty = true;
        break;
      default:
        this.main.warning('Could not confirm delete for ' + this.delete.type);
        break;
    }
  }

  deepCopy<T>(obj: T): T {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.deepCopy(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.deepCopy(obj[attr]);
      }
      return copy;
    }

    throw new Error("unable to deep copy object.");
  }
}

export class DeleteConfirmationSettings
{
  title: string;
  text: string;
  type: string;
  data: any;
}

