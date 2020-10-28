/*
Gameboard

Copyright 2020 Carnegie Mellon University.

NO WARRANTY. THIS CARNEGIE MELLON UNIVERSITY AND SOFTWARE ENGINEERING INSTITUTE MATERIAL IS FURNISHED ON AN "AS-IS" BASIS. CARNEGIE MELLON UNIVERSITY MAKES NO WARRANTIES OF ANY KIND, EITHER EXPRESSED OR IMPLIED, AS TO ANY MATTER INCLUDING, BUT NOT LIMITED TO, WARRANTY OF FITNESS FOR PURPOSE OR MERCHANTABILITY, EXCLUSIVITY, OR RESULTS OBTAINED FROM USE OF THE MATERIAL. CARNEGIE MELLON UNIVERSITY DOES NOT MAKE ANY WARRANTY OF ANY KIND WITH RESPECT TO FREEDOM FROM PATENT, TRADEMARK, OR COPYRIGHT INFRINGEMENT.

Released under a MIT (SEI)-style license, please see license.txt or contact permission@sei.cmu.edu for full terms.

[DISTRIBUTION STATEMENT A] This material has been approved for public release and unlimited distribution.  Please see Copyright notice for non-US Government use and distribution.

DM20-0284

*/

import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './svc/auth-guard.service';
import { ChallengeSpecListComponent } from './ui/challenge-developer/challenge-spec-list/challenge-spec-list.component';
import { ChallengeDeveloperDetailComponent } from './ui/challenge-developer/detail/detail.component';
import { ChallengeSpecLayoutComponent } from './ui/challenge-developer/layout.component';
import { ChallengePrintComponent } from './ui/challenge/challenge-print/challenge-print.component';
import { ChallengeComponent } from './ui/challenge/challenge.component';
import { ConsoleComponent } from './ui/console/console.component';
import { DocViewComponent } from './ui/doc-view/doc-view.component';
import { EnlistComponent } from './ui/enlist/enlist.component';
import { EnrollComponent } from './ui/enroll/enroll.component';
import { GameEditComponent } from './ui/game-designer/game-edit/game-edit.component';
import { GameListComponent } from './ui/game-designer/game-list/game-list.component';
import { GameDesignerLayoutComponent } from './ui/game-designer/layout.component';
import { GameboardComponent } from './ui/gameboard/gameboard.component';
import { GamespaceBrowserComponent } from './ui/gamespace-browser/gamespace-browser.component';
import { HomeComponent } from './ui/home/home.component';
import { LeaderboardComponent } from './ui/leaderboard/leaderboard.component';
import { LoginPromptComponent } from './ui/login-prompt/login-prompt.component';
import { OidcCallbackComponent } from './ui/oidc-callback/oidc-callback.component';
import { OidcSilentComponent } from './ui/oidc-silent/oidc-silent.component';
import { PageNotFoundComponent } from './ui/page-not-found/page-not-found.component';
import { CompletionReportComponent } from './ui/reports/completion-report/completion-report.component';
import { ParticipationReportComponent } from './ui/reports/participation-report/participation-report.component';
import { TagReportComponent } from './ui/reports/tag-report/tag-report.component';
import { SurveyComponent } from './ui/survey/survey.component';
import { TeamActivityComponent } from './ui/team-activity/team-activity.component';
import { UserListComponent } from './ui/user-list/user-list.component';
import { TeamDetailComponent } from './ui/team/team.component';
import { TeamListComponent } from './ui/team-list/team-list.component';
import { EnrollOrgComponent } from './ui/enroll/enroll-org/enroll-org.component';
import { EnrollStartComponent } from './ui/enroll/enroll-start/enroll-start.component';
import { EnrollInviteComponent } from './ui/enroll/enroll-invite/enroll-invite.component';
import { EnrollCompleteComponent } from './ui/enroll/enroll-complete/enroll-complete.component';
import { ChallengeSurveyReportComponent } from './ui/reports/challenge-survey-report/challenge-survey-report.component';
import { GameSurveyReportComponent } from './ui/reports/game-survey-report/game-survey-report.component';

const routes: Routes = [
  { path: 'console/:id/:name/:pid', component: ConsoleComponent, canActivate: [AuthGuardService]},
  { path: 'observe', component: GamespaceBrowserComponent, canActivate: [AuthGuardService] },
  { path: '', component: HomeComponent,
    children: [
      { path: 'login', component: LoginPromptComponent },
      { path: 'doc/:id', component: DocViewComponent },
      { path: 'scores', component: LeaderboardComponent },
      { path: 'board/:id/scores', component: LeaderboardComponent },
      { path: 'board/:id/challenge/:challengeId/survey', component: SurveyComponent },
      { path: 'board/:id/challenge/:challengeId', component: ChallengeComponent },
      { path: 'board/:id', component: GameboardComponent },
      { path: 'teams', component: TeamListComponent, canActivate: [AuthGuardService] },
      { path: 'users', component: UserListComponent, canActivate: [AuthGuardService] },
      {
        path: 'reports', children: [
          { path: 'participation-report', component: ParticipationReportComponent },
          { path: 'completion-report', component: CompletionReportComponent, canActivate: [AuthGuardService] },
          { path: 'tag-report', component: TagReportComponent, canActivate: [AuthGuardService] },
          { path: 'challenge-survey-report', component: ChallengeSurveyReportComponent, canActivate: [AuthGuardService] },
          { path: 'game-survey-report', component: GameSurveyReportComponent, canActivate: [AuthGuardService] }
        ]
      },
      { path: 'team/:id/activity', component: TeamActivityComponent },
      { path: 'team/:id', component: TeamDetailComponent },
      { path: 'enroll', component: EnrollComponent, canActivate: [AuthGuardService],
        children: [
          { path: 'organization', component: EnrollOrgComponent },
          { path: 'enrollment', component: EnrollStartComponent },
          { path: 'teammates', component: EnrollInviteComponent },
          { path: 'confirm', component: EnrollCompleteComponent }
        ]
      },
      { path: 'enlist/:code/team/:teamId', component: EnlistComponent, canActivate: [AuthGuardService]},
      { path: 'survey', component: SurveyComponent, canActivate: [AuthGuardService] },
      {
        path: 'challenge-developer', component: ChallengeSpecLayoutComponent, canActivate: [AuthGuardService],
        children: [
          { path: '', component: ChallengeSpecListComponent, canActivate: [AuthGuardService] },
          { path: 'new', component: ChallengeDeveloperDetailComponent, canActivate: [AuthGuardService] },
          { path: ':slug', component: ChallengeDeveloperDetailComponent, canActivate: [AuthGuardService] }
        ]
      },
      {
        path: 'game-designer', component: GameDesignerLayoutComponent, canActivate: [AuthGuardService],
        children: [
          { path: '', component: GameListComponent, canActivate: [AuthGuardService] },
          { path: 'new', component: GameEditComponent, canActivate: [AuthGuardService] },
          { path: ':id', component: GameEditComponent, canActivate: [AuthGuardService] }
        ]
      }
    ]
  },
  { path: 'challenge-print/:id', component: ChallengePrintComponent, canActivate: [AuthGuardService] },
  { path: 'oidc', component: OidcCallbackComponent},
  { path: 'oidc-silent', component: OidcSilentComponent },
  { path: '**', component: PageNotFoundComponent }
];

const routerOptions: ExtraOptions = {
  anchorScrolling: 'enabled',
  scrollPositionRestoration: 'enabled'
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

