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
    // eslint-disable-next-line no-console
    console.info('[PlayerClient] Connecting to SSE', { url });
    this.store.setConnectionState('RECONNECTING');

    this.zone.runOutsideAngular(() => {
      this.eventSource = new EventSource(url);
      const handleEvent = (message: MessageEvent) => {
        // eslint-disable-next-line no-console
        console.info('[PlayerClient] SSE message', {
          type: message.type,
          data: message.data,
        });
        this.zone.run(() => {
          if (!message.data || typeof message.data !== 'string') {
            return;
          }
          const eventData = extractEventData(message.data);
          if (!eventData) {
            // eslint-disable-next-line no-console
            console.warn('[PlayerClient] Unable to parse SSE payload', message.data);
            return;
          }
          const event = eventData as PlayerEvent;
          // eslint-disable-next-line no-console
          console.info('[PlayerClient] Parsed event', event);
          if (event.type === 'PLAYER_SNAPSHOT') {
            this.store.setSnapshot((event as { payload: any }).payload);
            return;
          }
          this.store.applyEvent(event);
        });
      };
      this.eventSource.onopen = () => {
        this.zone.run(() => {
          this.reconnectAttempts = 0;
          // eslint-disable-next-line no-console
          console.info('[PlayerClient] SSE connection opened');
          this.store.setConnectionState('CONNECTED');
        });
      };
      this.eventSource.onmessage = handleEvent;
      this.eventSource.addEventListener('PLAYER_SNAPSHOT', handleEvent);
      this.eventSource.addEventListener('ROLES_ASIGNADOS', handleEvent);
      this.eventSource.addEventListener('PREGUNTA_ASIGNADA', handleEvent);
      this.eventSource.addEventListener('DEBATE_INICIADO', handleEvent);
      this.eventSource.addEventListener('VOTACION_INICIADA', handleEvent);
      this.eventSource.onerror = () => {
        this.zone.run(() => {
          // eslint-disable-next-line no-console
          console.warn('[PlayerClient] SSE connection error');
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

const extractEventData = (raw: string): PlayerEvent | null => {
  try {
    return JSON.parse(raw) as PlayerEvent;
  } catch {
    const dataLine = raw
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.startsWith('data:'));
    if (!dataLine) {
      return null;
    }
    const payload = dataLine.replace(/^data:\s?/, '');
    try {
      return JSON.parse(payload) as PlayerEvent;
    } catch {
      return null;
    }
  }
};
