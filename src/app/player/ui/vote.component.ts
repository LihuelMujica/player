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
      <div class="h-full w-full overflow-hidden flex flex-col tmp-shell">
        <header class="top-0 w-full z-50 tmp-header">
          <h1 class="text-5xl uppercase tracking-widest text-center py-6 tmp-title">caretas</h1>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center">
          <ng-container *ngIf="!isWaiting(viewModel); else waitingScreen">
            <div class="justify-center items-center p-8 shadow-sm h-full w-1/2 tmp-panel">
              <p class="text-2xl text-center mb-5 tmp-copy">Vota por quien es el traidor</p>
              <form class="flex flex-col items-center gap-6" (ngSubmit)="onSubmit(viewModel)">
                <div class="flex flex-col gap-2">
                  <label class="font-bold flex items-center gap-2 tmp-label">
                    <svg
                      class="knife-icon"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fill="currentColor"
                        d="M21.5 3.5c-.6-.6-1.6-.6-2.2 0L13 9.8l1.8 1.8 6.2-6.1c.6-.6.6-1.6 0-2.1ZM2 21l6.7-2 5.4-5.4-3.7-3.7L4.9 15.3 2 22Zm3.6-4.6 4.1-4.1 1.8 1.8-4.1 4.1-2.4.7.6-2.5Z"
                      />
                    </svg>
                    ¿Quién es el traidor?
                  </label>

                  <label
                    class="flex items-center gap-2 tmp-option"
                    *ngFor="let option of availableOptions"
                  >
                    <input
                      type="radio"
                      name="voto"
                      [value]="option.playerId"
                      [(ngModel)]="selectedVote"
                      [disabled]="submitting"
                      class="tmp-radio"
                    />
                    {{ option.playerName }}
                  </label>

                  <label class="flex items-center gap-2 tmp-option">
                    <input
                      type="radio"
                      name="voto"
                      [value]="skipValue"
                      [(ngModel)]="selectedVote"
                      [disabled]="submitting"
                      class="tmp-radio"
                    />
                    Saltar votación
                  </label>
                </div>
                <button
                  class="text-4xl font-bold underline tmp-button"
                  type="submit"
                  [disabled]="submitting || !selectedVote"
                >
                  Votar
                </button>
                <p *ngIf="submitError" class="text-red-400 text-base text-center">
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
                    class="w-48 h-48 rounded-full flex items-center justify-center tmp-avatar"
                    aria-label="Avatar del jugador"
                  >
                    <span class="text-6xl font-bold text-gray-200">
                      {{ (viewModel.name || 'J')[0] }}
                    </span>
                  </div>
                  <p class="text-4xl text-center tmp-copy">
                    {{ viewModel.name || 'Jugador' }}
                  </p>
                </div>
                <div class="m-5">
                  <p class="text-2xl text-center tmp-copy">
                    Esperando a que todos contesten...
                  </p>
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
