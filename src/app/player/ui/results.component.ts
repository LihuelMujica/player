import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'player-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full gap-8 px-6 pt-28">
      <header class="fixed top-0 w-full tpm-header z-50">
        <h1 class="text-5xl font-bold uppercase text-center py-6 tpm-title">Game Name</h1>
      </header>
      <div class="tpm-panel px-10 py-8">
        <p class="text-2xl text-center tpm-highlight">Resultados de la ronda.</p>
      </div>
    </div>
  `,
})
export class ResultsComponent {}
