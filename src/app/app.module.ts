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

import { DatePipe } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { SnackbarModule } from 'ngx-snackbar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CounterPipe } from './pipes/counter.pipe';
import { EllipsisPipe } from './pipes/ellipsis.pipe';
import { TimespanPipe } from './pipes/timespan.pipe';
import { TocTitlePipe } from './pipes/toctile.pipe';
import { AuthGuardService } from './svc/auth-guard.service';
import { AuthService } from './svc/auth.service';
import { ClipboardService } from './svc/clipboard.service';
import { markedOptionsFactory, SettingsService } from './svc/settings.service';
import { UserService } from './svc/user.service';
import { ChallengeSpecDetailComponent } from './ui/challenge-developer/challenge-spec-detail/challenge-spec-detail.component';
import { ChallengeSpecEditComponent } from './ui/challenge-developer/challenge-spec-edit/challenge-spec-edit.component';
import { ChallengeSpecListComponent } from './ui/challenge-developer/challenge-spec-list/challenge-spec-list.component';
import { ChallengeDeveloperDetailComponent } from './ui/challenge-developer/detail/detail.component';
import { FlagSpecDetailComponent } from './ui/challenge-developer/flag-spec-detail/flag-spec-detail.component';
import { FlagSpecEditComponent } from './ui/challenge-developer/flag-spec-edit/flag-spec-edit.component';
import { ChallengeSpecLayoutComponent } from './ui/challenge-developer/layout.component';
import { VmSpecEditComponent } from './ui/challenge-developer/vm-spec-edit/vm-spec-edit.component';
import { WorkspaceSpecDetailComponent } from './ui/challenge-developer/workspace-spec-detail/workspace-spec-detail.component';
import { WorkspaceSpecEditComponent } from './ui/challenge-developer/workspace-spec-edit/workspace-spec-edit.component';
import { ChallengePrintComponent } from './ui/challenge/challenge-print/challenge-print.component';
import { ChallengeComponent } from './ui/challenge/challenge.component';
import { ConsoleComponent } from './ui/console/console.component';
import { DocListComponent } from './ui/doc-list/doc-list.component';
import { DocViewComponent } from './ui/doc-view/doc-view.component';
import { EnlistComponent } from './ui/enlist/enlist.component';
import { EnrollCompleteComponent } from './ui/enroll/enroll-complete/enroll-complete.component';
import { EnrollInviteComponent } from './ui/enroll/enroll-invite/enroll-invite.component';
import { EnrollOrgComponent } from './ui/enroll/enroll-org/enroll-org.component';
import { EnrollStartComponent } from './ui/enroll/enroll-start/enroll-start.component';
import { EnrollComponent } from './ui/enroll/enroll.component';
import { EventHorizonComponent } from './ui/event-horizon/event-horizon.component';
import { GameEditComponent } from './ui/game-designer/game-edit/game-edit.component';
import { GameListComponent } from './ui/game-designer/game-list/game-list.component';
import { GameDesignerLayoutComponent } from './ui/game-designer/layout.component';
import { GameboardListComponent } from './ui/gameboard-list/gameboard-list.component';
import { GameboardComponent } from './ui/gameboard/gameboard.component';
import { MapComponent } from './ui/gameboard/map/map.component';
import { TriviaComponent } from './ui/gameboard/trivia/trivia.component';
import { GamespaceBrowserComponent } from './ui/gamespace-browser/gamespace-browser.component';
import { HomeComponent } from './ui/home/home.component';
import { LeaderboardSummaryComponent } from './ui/leaderboard-summary/leaderboard-summary.component';
import { LeaderboardComponent } from './ui/leaderboard/leaderboard.component';
import { LoginPromptComponent } from './ui/login-prompt/login-prompt.component';
import { MemberComponent } from './ui/member/member.component';
import { OidcCallbackComponent } from './ui/oidc-callback/oidc-callback.component';
import { OidcSilentComponent } from './ui/oidc-silent/oidc-silent.component';
import { PageNotFoundComponent } from './ui/page-not-found/page-not-found.component';
import { CompletionReportComponent } from './ui/reports/completion-report/completion-report.component';
import { ParticipationReportComponent } from './ui/reports/participation-report/participation-report.component';
import { TagReportComponent } from './ui/reports/tag-report/tag-report.component';
import { BadgeComponent } from './ui/shared/badge/badge.component';
import { ConfirmButtonComponent } from './ui/shared/confirm-button/confirm-button.component';
import { PagerComponent } from './ui/shared/pager/pager';
import { VideoComponent } from './ui/shared/video/video.component';
import { SurveyComponent } from './ui/survey/survey.component';
import { TeamActivityComponent } from './ui/team-activity/team-activity.component';
import { TeamListComponent } from './ui/team-list/team-list.component';
import { TeamPresenceComponent } from './ui/team-presence/team-presence.component';
import { TeamDetailComponent } from './ui/team/team.component';
import { UserListComponent } from './ui/user-list/user-list.component';
import { UserComponent } from './ui/user/user.component';
import { AuthInterceptor } from './interceptors/http-auth-interceptor';
import { BoardHeaderComponent } from './ui/shared/board-header/board-header.component';
import { ChallengeSurveyReportComponent } from './ui/reports/challenge-survey-report/challenge-survey-report.component';
import { GameSurveyReportComponent } from './ui/reports/game-survey-report/game-survey-report.component';

@NgModule({
  declarations: [
    AppComponent,
    GameboardComponent,
    LeaderboardComponent,
    LeaderboardSummaryComponent,    
    ChallengeComponent,
    ChallengePrintComponent,
    HomeComponent,
    UserComponent,
    EnlistComponent,
    LoginPromptComponent,
    DocViewComponent,
    DocListComponent,
    ConfirmButtonComponent,
    GameboardListComponent,
    TocTitlePipe,
    TimespanPipe,
    CounterPipe,
    EllipsisPipe,
    MemberComponent,
    TeamPresenceComponent,
    ConsoleComponent,
    EnrollStartComponent,
    EnrollInviteComponent,
    EnrollCompleteComponent,
    EnrollOrgComponent,
    EnrollComponent,
    TeamListComponent,
    CompletionReportComponent,
    PageNotFoundComponent,
    TeamActivityComponent,
    TeamDetailComponent,
    ParticipationReportComponent,
    EventHorizonComponent,
    BadgeComponent,    
    UserListComponent,
    PagerComponent,
    BoardHeaderComponent,
    SurveyComponent,
    TagReportComponent,
    ChallengeSurveyReportComponent,
    GameSurveyReportComponent,
    GamespaceBrowserComponent,    
    VideoComponent,
    ChallengeSpecListComponent,
    ChallengeSpecEditComponent,
    ChallengeSpecLayoutComponent,
    GameDesignerLayoutComponent,
    GameListComponent,
    GameEditComponent,
    WorkspaceSpecEditComponent,
    VmSpecEditComponent,
    FlagSpecEditComponent,
    ChallengeDeveloperDetailComponent,
    WorkspaceSpecDetailComponent,
    FlagSpecDetailComponent,
    ChallengeSpecDetailComponent,
    OidcSilentComponent,
    OidcCallbackComponent,
    TriviaComponent,
    MapComponent    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    CollapseModule.forRoot(),
    BrowserAnimationsModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useFactory: markedOptionsFactory
      }
    }),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    SnackbarModule.forRoot()
  ],
  providers: [
    AuthService,
    AuthGuardService,
    SettingsService,
    UserService,
    ClipboardService,
    DatePipe,
    TimespanPipe,
    CounterPipe,
    {
        provide: APP_INITIALIZER,
        useFactory: initSettings,
        deps: [SettingsService],
        multi: true
    },
    {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true,
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function initSettings(settings: SettingsService) {
  return () => settings.load();
}

