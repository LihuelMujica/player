import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'player-answer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full">
      <p class="text-2xl">Escribe tu respuesta...</p>
    </div>
  `,
})
export class AnswerComponent {}
