import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'player-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full tmp-shell">
      <div class="tmp-panel p-8">
        <p class="text-2xl tmp-copy">Resultados de la ronda.</p>
      </div>
    </div>
  `,
})
export class ResultsComponent {}
