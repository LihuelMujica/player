import { Injectable, NgZone } from '@angular/core';
import { PlayerStoreService } from './player-store.service';
import { PlayerEvent } from './models';

@Injectable({ providedIn: 'root' })
export class PlayerClientService {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private readonly maxBackoffMs = 8000;

  constructor(
    private readonly store: PlayerStoreService,
    private readonly zone: NgZone,
  ) {}

  connect(roomCode: string, playerId: string): void {
    this.close();
    const url = `http://18.222.254.35:8080/sse/player?roomCode=${roomCode}&playerId=${playerId}`;
    this.store.setConnectionState('RECONNECTING');

    this.zone.runOutsideAngular(() => {
      this.eventSource = new EventSource(url);
      this.eventSource.onopen = () => {
        this.zone.run(() => {
          this.reconnectAttempts = 0;
          this.store.setConnectionState('CONNECTED');
        });
      };
      const handleEvent = (message: MessageEvent) => {
        this.zone.run(() => {
          if (!message.data) {
            return;
          }
          const event = parseEvent(message.data);
          if (!event) {
            return;
          }
          if (event.type === 'PLAYER_SNAPSHOT') {
            this.store.setSnapshot((event as { payload: any }).payload);
            return;
          }
          if (event.type === 'ROLES_ASIGNADOS') {
            this.store.setSnapshot((event as { payload: any }).payload);
            return;
          }
          this.store.applyEvent(event);
        });
      };

      this.eventSource.onmessage = handleEvent;
      this.eventSource.addEventListener('PLAYER_SNAPSHOT', handleEvent);
      this.eventSource.addEventListener('ROLES_ASIGNADOS', handleEvent);
      this.eventSource.onerror = () => {
        this.zone.run(() => {
          this.store.setConnectionState('RECONNECTING');
          this.close();
          this.retry(roomCode, playerId);
        });
      };
    });
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private retry(roomCode: string, playerId: string): void {
    this.reconnectAttempts += 1;
    const delay = Math.min(1000 * this.reconnectAttempts, this.maxBackoffMs);
    setTimeout(() => {
      this.connect(roomCode, playerId);
    }, delay);
  }
}

const parseEvent = (data: string): PlayerEvent | null => {
  try {
    return JSON.parse(data) as PlayerEvent;
  } catch (error) {
    const start = data.indexOf('{');
    const end = data.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(data.slice(start, end + 1)) as PlayerEvent;
      } catch (nestedError) {
        return null;
      }
    }
    return null;
  }
};
