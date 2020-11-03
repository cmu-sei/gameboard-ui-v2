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

export class BoardDetail {
  id?: string;
  name?: string;
  badges?: string;
  startText?: string;
  requiredBadges?: string;
  maxSubmissions?: number;
  maxMinutes?: number;
  maxHours?: number;
  requireLockedTeams?: boolean;
  isPractice?: boolean;
  isPreviewAllowed?: boolean;
  isResetAllowed?: boolean;
  isTitleVisible?: boolean;
  categories?: Array<CategoryDetail>;
  boardType?: BoardType;
  maps?: Array<MapDetail>;
  order?: number;
  startTime?: Date;
  stopTime?: Date;
  allowSharedWorkspaces?: boolean;
  certificateThreshold?: number;
  maxConcurrentProblems?: number;

  // ui only
  state?: BoardState;
  score?: number;
  isStartAllowed?: boolean;
}

export enum BoardType {
  Trivia = 'Trivia',
  Map = 'Map'
}

export class QuestionDetail {
  id?: string;
  order?: number;
  points?: number;
  challengeLink?: ChallengeLinkDetail;
  challenge?: ChallengeDetail;
  isDisabled?: boolean;
}

export class ChallengeLinkDetail {
  id?: string;
  slug?: string;
}

export class CoordinateDetail {
  id?: string;
  x?: number;
  y?: number;
  radius?: number;
  points?: number;
  challengeLink?: ChallengeLinkDetail;
  challenge?: ChallengeDetail;
  actionType?: ActionType;
  actionValue?: string;
  name?: string;
  isDisabled?: boolean;

  // ui only
  isNew?: boolean;
}

export enum ActionType {
  Challenge = 'Challenge',
  Video = 'Video',
  Image = 'Image',
  Document = 'Document',
  Map = 'Map'
}

export class CategoryDetail {
  id?: string;
  name?: string;
  order?: number;
  questions?: Array<QuestionDetail>;
}

export class MapDetail {
  id?: string;
  name?: string;
  imageUrl?: string;
  order?: number;
  coordinates?: Array<CoordinateDetail>;

  // ui only
  isNew: boolean;
}

export class TeamBoardUpdate {
  teamId?: string;
  boardId?: string;
  overrideMaxMinutes?: number;
}

export class TeamBoardDetail {
  teamId?: string;
  teamName?: string;
  board?: BoardDetail;
  start?: Date;
  score?: number;
  overrideMaxMinutes?: number;
  state?: BoardState;

  // ui only
  maxMinutes?: number;
}

export class TeamBoardStatus {
  teamBoard?: TeamBoardDetail;
  forecast?: Array<SessionForecast>;
}

export class TeamBoardEventDetail {
  id?: string;
  name?: string;
  board?: BoardDetail;  
  overrideMaxMinutes?: number;
  start?: Date;
  score?: number;
  challenges?: Array<ChallengeEventDetail>;
}

export class ChallengeEventDetail {
  id?: string;
  title?: string;
  tags?: string[];
  name?: string;
  points?: number;
  events?: Array<ProblemEventDetail>;
}

export class ProblemEventDetail {
  type?: number;
  timestamp?: Date;
  index?: number;
}

export class SessionForecast {
  time?: Date;
  available?: number;
  reserved?: number;
}

export class ChallengeProblem {
  challenge?: ChallengeDetail;
  problem?: ProblemDetail;
  board?: BoardDetail;
  state?: ChallengeState;
}

export class ChallengeDetail {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  tags?: string[];
  flagStyle?: string;
  flagCount?: number;
  tokenCount?: number;
  points?: number;
  boardMaxSubmissions?: number;
  isMultiStage?: boolean;
  isMultiPart?: boolean;

  // ui only
  problemStatus?: string;
  problemScore?: number;
  problemId?: string;
  totalMinutes?: number;
  gamespaceReady?: boolean;
}

export class ChallengeState {
  isStarted?: boolean;
  isActive?: boolean;
  isPending?: boolean;
  isError?: boolean;
  isComplete?: boolean;
  canSubmit?: boolean;
  attemptCount?: number;
  attemptMax?: number;
  duration?: number;
  grading?: boolean;
  restarting?: boolean;
}

export class BoardState {
  open?: boolean;
  active?: boolean;
  expired?: boolean;
  timespan?: number;
}

export class ProblemDetail {
  id?: string;
  challengeLinkId?: string;
  teamId?: string;
  status?: string;
  start?: Date;
  end?: Date;
  score?: number;
  estimatedReadySeconds?: number;
  submissions?: Array<SubmissionDetail>;
  tokens?: Array<TokenDetail>;
  text?: string;
  hasGamespace?: boolean;
  gamespaceReady?: boolean;
  gamespaceText?: string;
  isError?: boolean;
}

export class ProblemCreate {
  challengeId?: string;
  teamId?: string;
}

export class SubmissionCreate {
  problemId?: string;
  tokens?: string[];
}

export class SubmissionDetail {
  id?: string;
  problemId?: string;
  userId?: string;
  userName?: string;
  timestamp?: Date;
  status?: string;
  tokens?: Array<TokenDetail>;
}

export class TokenDetail {
  id?: string;
  value?: string;
  label?: string;
  percent?: number;
  index?: number;
  status?: TokenStatusType;
  timestamp?: Date;
}

export enum TokenStatusType {
  Pending = 'Pending',
  Correct = 'Correct',
  Incorrect = 'Incorrect'
}

export class PagedResult<T> {
  total?: number;
  results: Array<T> = [];
  dataFilter?: DataFilter;
}

export interface DataFilter {
  term?: string;
  skip?: number;
  take?: number;
  sort?: string;
  filter?: string;
}

export class TeamSummary {
  id?: string;
  name?: string;
  badges?: string[];
  organizationName?: string;
  organizationLogoUrl?: string;
}

export class TeamDetail {
  id?: string;
  name?: string;
  badges?: string[];
  isDisabled?: boolean;
  anonymizedName?: string;
  ownerUserId?: string;
  isLocked?: boolean;
  organizationName?: string;
  number?: number;
  organizationLogoUrl?: string;
  organizationUnitLogoUrl?: string;
  members?: Array<UserSummary>;
  created?: Date;
  teamBoards?: Array<TeamBoardDetail>;
  sortedBadges?: string;
}

export class TeamActivity {
  id?: string;
  name?: string;
  badges?: string[];
  isDisabled?: boolean;
  title?: string;
  start?: Date;
  end?: Date;
  status?: string;
  score?: number;
  problemId?: string;
  gamespaceReady?: boolean;
  boardId?: string;
  boardName?: string;
}

export class TeamInviteCode {
  id?: string;
  invitationCode?: string;
}

export class TeamCreate {
  name?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  organizationalUnitLogoUrl?: string;
}

export class TeamUpdate {
  id?: string;
  name?: string;
  organizationName?: string;
  organizationLogoUrl?: string;
  organizationalUnitLogoUrl?: string;
}

export interface UserSummary {
  id: string;
  name?: string;
  organization?: string;
  teamId?: string;
  teamName?: string;
  anonymizedTeamName?: string;
  isModerator?: boolean;
  isObserver?: boolean;
  isChallengeDeveloper?: boolean;
  isGameDesigner?: boolean;
}

export interface UserDetail {
  id?: string;
  name?: string;
  organization?: string;
  teamId?: string;
  teamName?: string;
  anonymizedTeamName?: string;
  isModerator?: boolean;
  isObserver?: boolean;
  isChallengeDeveloper?: boolean;
  isGameDesigner?: boolean;
}

export interface UserProfile {
  user?: UserDetail;
  team?: TeamDetail;
  claims?: any;
  online?: boolean;

}
export class SystemMessage {
  type: string;
  value?: any;
  key?: any;
}

export class SnackbarMessage {
  message?: SystemMessage;
  data?: any;
}

export interface MemberPresence {
  id?: string;
  name?: string;
  teamId?: string;
  picture?: string;
  picture_o?: string;
  picture_ou?: string;
  online?: boolean;
  self?: boolean;
  eventType?: PresenceEvent;
}

export enum PresenceEvent {
  arrival = 0,
  departure = 1,
  greeting = 2,
  kicked = 3,
  score = 4
}

export class Leaderboard {
  results?: Array<LeaderboardScore>;
  isEmpty?: boolean;
  boardId?: string;
  total?: number;
  totalTeams?: number;
  totalActive?: number;
  dataFilter?: DataFilter;
}

export interface LeaderboardScore {
  id?: string;
  name?: string;
  anonymizedName?: string;
  badges?: string[];
  number?: number;
  isDisabled?: boolean;
  score?: number;
  counts?: LeaderboardScoreCounts;
  duration?: number;
  rank?: number;
  organizationName?: string;
  organizationLogoUrl?: string;
  organizationalUnitLogoUrl?: string;
  maxMinutes?: number;
  start?: Date;
  timer?: string;
  isActive?: boolean;
}

export interface LeaderboardScoreCounts {
  success?: number;
  partial?: number;
  failure?: number;
  total?: number;
}

export interface TeamBadgeUpdate {
  id?: string;
  name?: string;
  badges?: string[];
  score?: number;
  rank?: number;
  organizationLogoUrl?: string;
}

export interface LeaderboardUpdated {
  boardId?: string;
}

export interface ProblemVm {
  problemId?: string;
  vmId?: string;
  vmName?: string;
}

export interface ProblemConsoleDetail {
  id?: string;
  topoId?: string;
  name?: string;
  url?: string;
  conditions?: string;
  isRunning?: boolean;
}

export interface ProblemConsoleAction {
  id?: string;
  vmId?: string;
  type?: string;
  message?: string;
}

export interface ParticipationReport {
  teamRegistrantCount?: number;
  individualRegistrantCount?: number;
  teamCount?: number;
  organizations: Array<Organization>;
  text?: string;
}

export interface ChallengeTagReport {
  name?: string;
  result: PagedResult<ChallengeDetail>;
}

export interface Organization {
  name?: string;
  teamCount?: number;
  logo?: string;
}

export interface MessageCreate {
  to?: Array<string>;
  subject?: string;
  body?: string;
  error?: string;
  success?: string;
}

export class ChallengeSurveyReport {
  boardId?: string;
  boardName?: string;
  items?: Array<ChallengeSurveyItem>;
}

export class ChallengeSurveyItem {
  challengeId?: string;
  challengeTitle?: string;
  question?: string;
  answer?: string;  
  date?: Date;
}

export class SurveyReport {
  gameId?: string;
  gameName?: string;
  items?: Array<SurveyItem>;
}

export class SurveyItem {  
  question?: string;
  answer?: string;  
  date?: Date;
}

export class BoardCompletionReport {
  id?: string;
  name?: string;
  items?: Array<BoardCompletionReportItem>;
}

export class BoardCompletionReportItem {
  id?: string;
  name?: string;
  boardType?: BoardType;
  challenges?: Array<BoardCompletionReportChallenge>;
}

export class BoardCompletionReportChallenge {
  id?: string;
  title?: string;
  total?: number;
  points?: number;
  averageMilliseconds?: number;
  success?: BoardCompletionReportChallengeStat;
  partial?: BoardCompletionReportChallengeStat;
  failure?: BoardCompletionReportChallengeStat;
}

export class BoardCompletionReportChallengeStat {
  ratio?: number;
  count?: number;
}

export interface TeamBadgeUpdate {
  id?: string;
  badges?: string[];
}

export class Question {
  text?: string;
  type?: string;
  options?: QuestionOption[];
}

export class QuestionOption {
  label?: string;
  value?: string;
}

export class Answer {
  text = '';
  type = '';
  value = '';
  error = false;
}

export class BoardTimes {
  name?: string;
  start?: Date;
  end?: Date;
}

export class GamespaceDetail {
  id?: string;
  start?: string;
  teamId?: string;
  teamName?: string;
  teamOrganizationName?: string;
  teamNumber?: string;
  challengeId?: string;
  challengeSlug?: string;
  challengeTitle?: string;
  challengePoints?: number;
  challengeCategoryName?: string;
}

export class GameboardDisplay {
  id?: string;
  name?: string;
  categories: Array<CategoryDetail> = [];
  challenges: ChallengeDetail[] = [];
}

export interface BoardMap {
  id?: string;
  url?: string;
  spots?: Array<HotSpot>;
}

export interface HotSpot {
  x?: number;
  y?: number;
  r?: number;
  action?: string;
  state?: string;
}

export interface OrganizationDetail {
  name?: string;
  title?: string;
  logo?: string;
}

export interface ChallengeSpec {
  slug?: string;
  title?: string;
  description?: string;
  authors?: string;
  tags?: string;
  text?: string;
  document?: string;
  difficulty?: number;
  flagStyle?: FlagStyle;
  flags?: FlagSpec[];
  workspace?: WorkspaceSpec;
  isMultiStage?: boolean;
  isMultiPart?: boolean;
}

export interface TokenSpec
{
  value?: string;
  percent?: number;
  label?: string;
}

export enum FlagStyle {
  Token = 'Token',
  Text = 'Text'
}

export interface FlagSpec {
  type?: FlagType;
  value?: number;
  tokens: TokenSpec[];
  files?: string[];
  iso?: string;
  text?: string;
  isoRestricted?: boolean;
  generateOutputText?: string;
  generateOutputFlag?: string;
  generateOutputFileList?: string;
  generateCommand?: string;
  generateImage?: string;
  gradeInputFlag?: string;
  gradeInputData?: string;
  gradeInputFile?: string;
  gradeOutputFile?: string;
  gradeCommand?: string;
  gradeImage?: string;
  gradeCommandTimeout?: number;
  workspace?: WorkspaceSpec;
}

export enum FlagType {
  Match = 'Match',
  MatchAll = 'MatchAll',
  MatchAny = 'MatchAny',
  MatchOutput = 'MatchOutput',
  MatchAlphaNumeric = 'MatchAlphaNumeric'
}

export interface WorkspaceSpec {
  id?: number;
  network?: NetworkSpec;
  vms?: VmSpec[];
  customizeTemplates?: boolean;
  templates?: string;
  iso?: string;
  isoTarget?: string;
  hostAffinity?: boolean;
  appendMarkdown?: boolean;
}

export interface NetworkSpec {
  hosts?: string[];
  newIp?: string;
  dnsmasq?: string[];
}

export interface VmSpec {
  name?: string;
  replicas?: number;
  skipIso?: boolean;
}

export interface ChallengeStart
{
  challengeId?: string;
  flagIndex?: number;
}

export interface GameDetail {
  id?: string;
  name?: string;
  enrollmentEndsAt?: Date;
  isEnrollmentAllowed?: boolean;
  isMultiplayer?: boolean;
  maxTeamSize?: number;
  minTeamSize?: number;
  maxConcurrentProblems?: number;
  startTime?: Date;
  stopTime?: Date;
  boards?: BoardDetail[];
}

export interface PageLocation {
  x?: number;
  factorX?: number;
  y?: number;
  factorY?: number;
}

