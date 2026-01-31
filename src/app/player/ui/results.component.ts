import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'player-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full">
      <p class="text-2xl">Resultados de la ronda.</p>
    </div>
  `,
})
export class ResultsComponent {}
