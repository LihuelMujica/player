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
    <div class="flex flex-col items-center justify-center h-full gap-8 tmp-shell">
      <header class="fixed top-0 w-full z-50 tmp-header">
        <h1 class="text-5xl uppercase tracking-widest text-center py-6 tmp-title">caretas</h1>
      </header>

      <div class="rounded-lg p-8 m-5 shadow-sm tmp-panel">
        <form
          class="flex flex-col items-center gap-6"
          (ngSubmit)="joinRoom()"
          #joinForm="ngForm"
        >
          <div class="flex flex-col items-start gap-2">
            <label class="font-bold text-2xl tmp-label" for="codigo">Código</label>
            <input
              type="text"
              id="codigo"
              name="codigo"
              placeholder="1234"
              class="rounded-lg p-4 w-64 text-xl text-center tmp-input"
              required
              maxlength="4"
              [(ngModel)]="roomCode"
            />
          </div>

          <div class="flex flex-col items-start gap-2">
            <label class="font-bold text-2xl tmp-label" for="nombre">Nombre</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              placeholder="nombre"
              class="rounded-lg p-4 w-64 text-xl text-center tmp-input"
              required
              [(ngModel)]="playerName"
            />
          </div>

          <p *ngIf="errorMessage" class="text-red-400 text-center text-lg">
            {{ errorMessage }}
          </p>

          <button
            class="font-bold text-4xl underline mt-4 tmp-button"
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
  private static readonly storageKey = 'playerIdByNameRoom';

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

    const trimmedRoomCode = this.roomCode.trim();
    const trimmedName = this.playerName.trim();

    if (!trimmedRoomCode || !trimmedName) {
      this.errorMessage = 'Completa el código y el nombre.';
      return;
    }

    const savedPlayerId = this.getSavedPlayerId(trimmedName, trimmedRoomCode);
    if (savedPlayerId) {
      this.loading = true;
      this.store.setJoinInfo(trimmedRoomCode, savedPlayerId, trimmedName, 1);
      this.client.connect(trimmedRoomCode, savedPlayerId);
      this.loading = false;
      return;
    }

    this.loading = true;
    this.api.joinRoom({
      roomCode: trimmedRoomCode,
      name: trimmedName,
      avatarId: 1,
    })
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.savePlayerId(trimmedName, trimmedRoomCode, response.playerId);
          this.store.setJoinInfo(trimmedRoomCode, response.playerId, trimmedName, 1);
          this.client.connect(trimmedRoomCode, response.playerId);
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error?.error?.message ?? 'No se pudo conectar a la sala.';
        },
      });
  }

  private savePlayerId(name: string, roomCode: string, playerId: string): void {
    const current = this.readStoredPlayers();
    current[this.buildStorageKey(name, roomCode)] = playerId;
    localStorage.setItem(JoinRoomComponent.storageKey, JSON.stringify(current));
  }

  private getSavedPlayerId(name: string, roomCode: string): string | null {
    const current = this.readStoredPlayers();
    return current[this.buildStorageKey(name, roomCode)] ?? null;
  }

  private readStoredPlayers(): Record<string, string> {
    const raw = localStorage.getItem(JoinRoomComponent.storageKey);
    if (!raw) {
      return {};
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }

  private buildStorageKey(name: string, roomCode: string): string {
    return `${name}|${roomCode}`;
  }
}
