import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { GameShellComponent } from './app/player/game-shell.component';

bootstrapApplication(GameShellComponent, {
  providers: [provideHttpClient()],
}).catch((err) => console.error(err));
