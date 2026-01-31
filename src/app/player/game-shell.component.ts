import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStoreService } from './player-store.service';
import { JoinRoomComponent } from './ui/join-room.component';
import { LobbyComponent } from './ui/lobby.component';
import { AnswerComponent } from './ui/answer.component';
import { VoteComponent } from './ui/vote.component';
import { ResultsComponent } from './ui/results.component';
import { RoleAssignmentComponent } from './ui/role-assignment.component';
import { DebateComponent } from './ui/debate.component';

@Component({
  selector: 'player-game-shell',
  standalone: true,
  imports: [
    CommonModule,
    JoinRoomComponent,
    LobbyComponent,
    RoleAssignmentComponent,
    AnswerComponent,
    VoteComponent,
    ResultsComponent,
    DebateComponent,
  ],
  template: `
    <div class="h-screen w-screen overflow-hidden">
      <ng-container *ngIf="vm$ | async as vm">
        <ng-container [ngSwitch]="vm.phase">
          <player-join-room *ngSwitchCase="'JOIN'"></player-join-room>
          <player-lobby *ngSwitchCase="'LOBBY'" [vm]="vm"></player-lobby>
          <player-role-assignment *ngSwitchCase="'ROLE_ASSIGNMENT'" [vm]="vm"></player-role-assignment>
          <player-answer *ngSwitchCase="'ANSWER'" [vm]="vm"></player-answer>
          <player-vote *ngSwitchCase="'VOTE'"></player-vote>
          <player-results *ngSwitchCase="'RESULTS'"></player-results>
          <player-debate *ngSwitchCase="'DEBATE'" [vm]="vm"></player-debate>
          <player-lobby *ngSwitchDefault [vm]="vm"></player-lobby>
        </ng-container>
      </ng-container>
    </div>
  `,
})
export class GameShellComponent {
  readonly vm$ = this.store.vm$;

  constructor(private readonly store: PlayerStoreService) {}
}
