import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerViewModel } from '../models';

@Component({
  selector: 'player-lobby',
  standalone: true,
  imports: [CommonModule],
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
            <span class="text-6xl font-bold text-gray-200">
              {{ (vm?.name || 'J')[0] }}
            </span>
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
