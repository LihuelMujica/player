import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { PlayerApiService } from '../player-api.service';
import { PlayerViewModel } from '../models';

@Component({
  selector: 'player-answer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <ng-container *ngIf="vm as viewModel">
      <div class="h-full w-full overflow-hidden flex flex-col">
        <header class="top-0 w-full tpm-header z-50">
          <h1 class="text-5xl font-bold uppercase text-center py-6 tpm-title">Game Name</h1>
        </header>

        <main class="flex-1 flex flex-col items-center justify-center">
          <ng-container *ngIf="!isWaiting(viewModel); else waitingScreen">
            <div class="justify-center items-center p-8 h-full w-11/12 max-w-2xl tpm-panel">
              <p class="text-2xl text-center mb-5 tpm-highlight">
                {{ viewModel.currentQuestion?.pregunta || 'Esperando pregunta...' }}
              </p>
              <form class="flex flex-col items-center gap-6" (ngSubmit)="onSubmit(viewModel)">
                <div class="w-full">
                  <input
                    class="tpm-input p-4 text-xl text-center w-full"
                    type="text"
                    name="answerText"
                    placeholder="Responder"
                    [(ngModel)]="answerText"
                    [disabled]="submitting"
                  />
                </div>
                <button
                  class="tpm-button text-3xl font-bold"
                  type="submit"
                  [disabled]="submitting || !answerText.trim()"
                >
                  Enviar
                </button>
                <p *ngIf="submitError" class="text-red-300 text-base text-center">
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
                    class="w-48 h-48 rounded-full flex items-center justify-center tpm-avatar"
                    aria-label="Avatar del jugador"
                  >
                    <span class="text-6xl font-bold tpm-avatar-letter">
                      {{ (viewModel.name || 'J')[0] }}
                    </span>
                  </div>
                  <p class="text-4xl text-center tpm-highlight">{{ viewModel.name || 'Jugador' }}</p>
                </div>
                <div class="m-5 tpm-panel px-8 py-6">
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
export class AnswerComponent implements OnChanges {
  @Input() vm: PlayerViewModel | null = null;

  answerText = '';
  submitting = false;
  submitError = '';
  private submitted = false;
  private lastQuestionId: number | null = null;
  private lastState: PlayerViewModel['state'] | null = null;

  constructor(private readonly api: PlayerApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vm']) {
      const questionId = this.vm?.currentQuestion?.id ?? null;
      if (questionId !== this.lastQuestionId) {
        this.answerText = '';
        this.submitted = false;
        this.submitError = '';
        this.lastQuestionId = questionId;
      }
      if (this.vm?.state === 'RESPONDIENDO' && this.lastState === 'RESPUESTA_ENVIADA') {
        this.submitted = false;
        this.submitError = '';
      }
      this.lastState = this.vm?.state ?? null;
    }
  }

  isWaiting(viewModel: PlayerViewModel): boolean {
    return this.submitted || viewModel.state === 'RESPUESTA_ENVIADA';
  }

  onSubmit(viewModel: PlayerViewModel): void {
    if (this.submitting) {
      return;
    }
    const roomCode = viewModel.roomCode;
    const playerId = viewModel.playerId;
    const answer = this.answerText.trim();
    if (!roomCode || !playerId || !answer) {
      return;
    }
    this.submitting = true;
    this.submitError = '';
    this.api
      .submitAnswer(roomCode, playerId, answer)
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
          this.submitError = error?.error?.message ?? 'No se pudo enviar la respuesta.';
        },
      });
  }
}
