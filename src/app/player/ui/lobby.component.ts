import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerViewModel } from '../models';
import { AvatarImageUrlPipe } from './avatar-image-url.pipe';

@Component({
  selector: 'player-lobby',
  standalone: true,
  imports: [CommonModule, AvatarImageUrlPipe],
  template: `
    <div class="flex flex-col items-center justify-center h-full gap-8 tmp-shell">
      <header class="fixed top-0 w-full z-50 tmp-header">
        <h1 class="text-5xl uppercase tracking-widest text-center py-6 tmp-title">caretas</h1>
      </header>

      <div>
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-48 h-48 rounded-full flex items-center justify-center tmp-avatar"
            aria-label="Avatar del jugador"
          >
            <ng-container *ngIf="(vm?.avatarId | avatarImageUrl) as avatarUrl; else initials">
              <img
                class="tmp-avatar-image"
                [src]="avatarUrl"
                [alt]="vm?.name ? 'Avatar de ' + vm?.name : 'Avatar del jugador'"
              />
            </ng-container>
            <ng-template #initials>
              <span class="text-6xl font-bold text-gray-200">
                {{ (vm?.name || 'J')[0] }}
              </span>
            </ng-template>
          </div>
          <p class="text-4xl text-center tmp-copy">{{ vm?.name || 'Jugador' }}</p>
        </div>
        <div class="m-5">
          <p class="text-2xl text-center tmp-copy">
            Esperando a que el host inicie el juego
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LobbyComponent {
  @Input() vm: PlayerViewModel | null = null;
}
