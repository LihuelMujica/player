import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerApiService } from '../player-api.service';
import { PlayerClientService } from '../player-client.service';
import { PlayerStoreService } from '../player-store.service';

@Component({
  selector: 'player-join-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full gap-8">
      <header class="fixed top-0 w-full bg-white z-50">
        <h1 class="text-5xl font-bold uppercase tracking-widest text-center py-6">Game Name</h1>
      </header>

      <div class="border-2 border-gray-300 rounded-lg p-8 m-5 shadow-sm bg-white">
        <form
          class="flex flex-col items-center gap-6"
          (ngSubmit)="joinRoom()"
          #joinForm="ngForm"
        >
          <div class="flex flex-col items-start gap-2">
            <label class="font-bold text-2xl" for="codigo">Código</label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              placeholder="1234"
              class="border-2 border-gray-300 rounded-lg p-4 w-64 text-xl text-center"
              required
              maxlength="4"
              [(ngModel)]="roomCode"
            />
          </div>

          <div class="flex flex-col items-start gap-2">
            <label class="font-bold text-2xl" for="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="nombre"
              class="border-2 border-gray-300 rounded-lg p-4 w-64 text-xl text-center"
              required
              [(ngModel)]="playerName"
            />
          </div>

          <p *ngIf="errorMessage" class="text-red-600 text-center text-lg">
            {{ errorMessage }}
          </p>

          <button
            class="font-bold text-4xl underline mt-4 hover:text-gray-700"
            type="submit"
            [disabled]="joinForm.invalid || loading"
          >
            {{ loading ? '...' : 'JUGAR' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class JoinRoomComponent {
  roomCode = '';
  playerName = '';
  errorMessage = '';
  loading = false;

  constructor(
    private readonly api: PlayerApiService,
    private readonly client: PlayerClientService,
    private readonly store: PlayerStoreService,
  ) {}

  joinRoom(): void {
    this.errorMessage = '';

    if (!this.roomCode || !this.playerName) {
      this.errorMessage = 'Completa el código y el nombre.';
      return;
    }

    this.loading = true;
    this.api.joinRoom({
      roomCode: this.roomCode,
      name: this.playerName,
      avatarId: 1,
    })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.store.setJoinInfo(this.roomCode, response.playerId, this.playerName, 1);
          this.client.connect(this.roomCode, response.playerId);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message ?? 'No se pudo conectar a la sala.';
        },
      });
  }
}
