import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerViewModel } from '../models';

@Component({
  selector: 'player-role-assignment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full gap-8 px-6 pt-28">
      <header class="fixed top-0 w-full tpm-header z-50">
        <h1 class="text-5xl font-bold uppercase text-center py-6 tpm-title">Game Name</h1>
      </header>

      <div>
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-48 h-48 rounded-full flex items-center justify-center overflow-hidden tpm-avatar"
            aria-label="Avatar del jugador"
          >
            <span class="text-6xl font-bold tpm-avatar-letter">
              {{ (vm?.name || 'J')[0] }}
            </span>
          </div>
          <p class="text-4xl text-center tpm-highlight">{{ vm?.name || 'Jugador' }}</p>
        </div>
        <div class="text-center text-2xl m-5 tpm-panel px-8 py-6">
          Tu eres el
          <span
            class="text-2xl font-black uppercase"
            [ngClass]="vm?.isImpostor ? 'tpm-danger' : 'tpm-accent'"
          >
            {{ vm?.isImpostor ? 'impostor' : 'ciudadano' }}
          </span>
        </div>
      </div>
    </div>
  `,
})
export class RoleAssignmentComponent {
  @Input() vm: PlayerViewModel | null = null;
}
