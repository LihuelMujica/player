import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerViewModel } from '../models';

@Component({
  selector: 'player-role-assignment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full gap-8">
      <header class="fixed top-0 w-full bg-white z-50">
        <h1 class="text-5xl font-bold uppercase tracking-widest text-center py-6">Game Name</h1>
      </header>

      <div>
        <div class="flex flex-col items-center gap-4">
          <div
            class="w-48 h-48 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden"
            aria-label="Avatar del jugador"
          >
            <span class="text-6xl font-bold text-gray-400">
              {{ (vm?.name || 'J')[0] }}
            </span>
          </div>
          <p class="text-4xl text-center">{{ vm?.name || 'Jugador' }}</p>
        </div>
        <div class="text-center text-2xl m-5">
          Tu eres el
          <span
            class="text-2xl font-black uppercase"
            [ngClass]="vm?.isImpostor ? 'text-red-600' : 'text-blue-600'"
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
