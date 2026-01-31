import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStoreService } from './player-store.service';
import { JoinRoomComponent } from './ui/join-room.component';
import { LobbyComponent } from './ui/lobby.component';
import { AnswerComponent } from './ui/answer.component';
import { VoteComponent } from './ui/vote.component';
import { ResultsComponent } from './ui/results.component';

@Component({
  selector: 'player-game-shell',
  standalone: true,
  imports: [
    CommonModule,
    JoinRoomComponent,
    LobbyComponent,
    AnswerComponent,
    VoteComponent,
    ResultsComponent,
  ],
  template: `
    <div class="h-screen w-screen overflow-hidden">
      <ng-container *ngIf="vm$ | async as vm">
        <ng-container [ngSwitch]="vm.phase">
          <player-join-room *ngSwitchCase="'JOIN'"></player-join-room>
          <player-lobby *ngSwitchCase="'LOBBY'" [vm]="vm"></player-lobby>
          <player-answer *ngSwitchCase="'ANSWER'"></player-answer>
          <player-vote *ngSwitchCase="'VOTE'"></player-vote>
          <player-results *ngSwitchCase="'RESULTS'"></player-results>
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
