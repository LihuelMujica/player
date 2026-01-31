import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerViewModel } from '../models';

@Component({
  selector: 'player-debate',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full gap-8 px-6 pt-28">
      <header class="fixed top-0 w-full tpm-header z-50">
        <h1 class="text-5xl font-bold uppercase text-center py-6 tpm-title">Game Name</h1>
      </header>

      <div class="flex flex-col items-center">
        <div class="w-48 h-48 rounded-full overflow-hidden tpm-avatar">
          <img
            src="assets/img/avatar.svg"
            alt="Avatar del jugador"
            class="w-full h-full object-cover"
          />
        </div>
        <p class="text-4xl text-center mt-4 tpm-highlight">{{ vm?.name || 'nombre player' }}</p>
      </div>

      <div class="m-5 tpm-panel px-8 py-6">
        <p class="text-2xl text-center">Debatan!</p>
      </div>
    </div>
  `,
})
export class DebateComponent {
  @Input({ required: true }) vm: PlayerViewModel | null = null;
}
