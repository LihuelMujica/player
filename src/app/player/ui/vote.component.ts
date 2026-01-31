import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PlayerApiService } from '../player-api.service';
import { PlayerClientService } from '../player-client.service';
import { PlayerViewModel, VoteOption } from '../models';

@Component({
  selector: 'player-vote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="vm as viewModel">
      <div class="h-full w-full overflow-hidden flex flex-col">
        <header class="top-0 w-full bg-white z-50">
          <h1 class="text-5xl font-bold uppercase tracking-widest text-center py-6">Game Name</h1>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center">
          <ng-container *ngIf="!isWaiting(viewModel); else waitingScreen">
            <div class="justify-center items-center p-8 shadow-sm h-full w-1/2">
              <p class="text-2xl text-center mb-5">Vota por quien es el traidor</p>
              <form class="flex flex-col items-center gap-6" (ngSubmit)="onSubmit(viewModel)">
                <div class="flex flex-col gap-2">
                  <label class="font-bold">¿Quién es el traidor?</label>

                  <label
                    class="flex items-center gap-2"
                    *ngFor="let option of availableOptions"
                  >
                    <input
                      type="radio"
                      name="voto"
                      [value]="option.playerId"
                      [(ngModel)]="selectedVote"
                      [disabled]="submitting"
                    />
                    {{ option.playerName }}
                  </label>

                  <label class="flex items-center gap-2">
                    <input
                      type="radio"
                      name="voto"
                      [value]="skipValue"
                      [(ngModel)]="selectedVote"
                      [disabled]="submitting"
                    />
                    Saltar votación
                  </label>
                </div>
                <button
                  class="text-4xl font-bold underline hover:text-gray-700 disabled:text-gray-400"
                  type="submit"
                  [disabled]="submitting || !selectedVote"
                >
                  Votar
                </button>
                <p *ngIf="submitError" class="text-red-600 text-base text-center">
                  {{ submitError }}
                </p>
              </form>
            </div>
          </ng-container>

          <ng-template #waitingScreen>
            <div class="flex flex-col items-center justify-center h-full gap-8">
              <div>
                <div class="flex flex-col items-center gap-4">
                  <div
                    class="w-48 h-48 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center"
                    aria-label="Avatar del jugador"
                  >
                    <span class="text-6xl font-bold text-gray-400">
                      {{ (viewModel.name || 'J')[0] }}
                    </span>
                  </div>
                  <p class="text-4xl text-center">{{ viewModel.name || 'Jugador' }}</p>
                </div>
                <div class="m-5">
                  <p class="text-2xl text-center">Esperando a que todos contesten...</p>
                </div>
              </div>
            </div>
          </ng-template>
        </main>
      </div>
    </ng-container>
  `,
})
export class VoteComponent implements OnChanges {
  @Input() vm: PlayerViewModel | null = null;

  availableOptions: VoteOption[] = [];
  selectedVote = '';
  submitting = false;
  submitError = '';
  private submitted = false;
  private lastOptionsKey = '';
  private lastState: PlayerViewModel['state'] | null = null;
  readonly skipValue = '__SKIP_VOTE__';

  constructor(
    private readonly api: PlayerApiService,
    private readonly client: PlayerClientService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vm']) {
      const viewModel = this.vm;
      const options = viewModel?.voteOptions ?? [];
      const filteredOptions = options.filter((option) => option.playerId !== viewModel?.playerId);
      const optionsKey = filteredOptions
        .map((option) => `${option.playerId}:${option.playerName}`)
        .join('|');
      if (optionsKey !== this.lastOptionsKey) {
        this.availableOptions = filteredOptions;
        this.selectedVote = '';
        this.submitted = false;
        this.submitError = '';
        this.lastOptionsKey = optionsKey;
      }
      if (viewModel?.state === 'VOTANDO' && this.lastState === 'VOTO_ENVIADO') {
        this.submitted = false;
        this.submitError = '';
      }
      this.lastState = viewModel?.state ?? null;
    }
  }

  isWaiting(viewModel: PlayerViewModel): boolean {
    return this.submitted || viewModel.state === 'VOTO_ENVIADO';
  }

  onSubmit(viewModel: PlayerViewModel): void {
    if (this.submitting || !this.selectedVote) {
      return;
    }
    const roomCode = viewModel.roomCode;
    const playerId = viewModel.playerId;
    if (!roomCode || !playerId) {
      return;
    }
    const votedPlayerId = this.selectedVote === this.skipValue ? '' : this.selectedVote;
    this.submitting = true;
    this.submitError = '';
    this.api
      .vote(roomCode, playerId, votedPlayerId)
      .pipe(
        finalize(() => {
          this.submitting = false;
        }),
      )
      .subscribe({
        next: () => {
          this.submitted = true;
        },
        error: (error: { error?: { message?: string } }) => {
          this.submitError = error?.error?.message ?? 'No se pudo enviar el voto.';
          this.client.connect(roomCode, playerId);
        },
      });
  }
}
