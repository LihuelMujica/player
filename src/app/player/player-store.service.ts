import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ConnectionState,
  PlayerEvent,
  PlayerPhase,
  PlayerSnapshotPayload,
  PlayerState,
  PlayerViewModel,
} from './models';

const initialViewModel: PlayerViewModel = {
  phase: 'JOIN',
  roomCode: null,
  playerId: null,
  name: '',
  avatarId: null,
  isImpostor: false,
  state: null,
  connectionState: 'DISCONNECTED',
  currentQuestion: null,
};

@Injectable({ providedIn: 'root' })
export class PlayerStoreService {
  private readonly subject = new BehaviorSubject<PlayerViewModel>(initialViewModel);
  readonly vm$ = this.subject.asObservable();

  get snapshot(): PlayerViewModel {
    return this.subject.getValue();
  }

  setSnapshot(payload: PlayerSnapshotPayload): void {
    const isImpostor = payload.isImpostor ?? payload.impostor ?? false;
    const nextState: PlayerViewModel = {
      ...this.snapshot,
      phase: phaseFromState(payload.state),
      playerId: payload.playerId,
      name: payload.name,
      avatarId: payload.avatarId,
      isImpostor,
      state: payload.state,
      connectionState: payload.connectionState ?? 'CONNECTED',
      currentQuestion: payload.currentQuestion,
    };
    this.subject.next(nextState);
  }

  applyEvent(event: PlayerEvent): void {
    if (event.type === 'PLAYER_SNAPSHOT') {
      const payload = (event as { payload: PlayerSnapshotPayload }).payload;
      if (payload) {
        this.setSnapshot(payload);
      }
      return;
    }

    this.subject.next({
      ...this.snapshot,
    });
  }

  setJoinInfo(roomCode: string, playerId: string, name: string, avatarId: number): void {
    this.subject.next({
      ...this.snapshot,
      phase: 'WAITING',
      roomCode,
      playerId,
      name,
      avatarId,
      isImpostor: this.snapshot.isImpostor,
    });
  }

  setConnectionState(connectionState: ConnectionState): void {
    this.subject.next({
      ...this.snapshot,
      connectionState,
    });
  }
}

const phaseFromState = (state: PlayerState | null): PlayerPhase => {
  switch (state) {
    case 'IN_LOBBY':
      return 'LOBBY';
    case 'RESPONDIENDO':
    case 'RESPUESTA_ENVIADA':
      return 'ANSWER';
    case 'VOTANDO':
    case 'VOTO_ENVIADO':
      return 'VOTE';
    case 'GANADOR':
    case 'PERDEDOR':
    case 'EMPATE':
      return 'RESULTS';
    case 'ASIGNANDO_ROL':
      return 'ROLE';
    case 'DEBATIENDO':
    case 'ESPERANDO_SIGUIENTE_RONDA':
      return 'WAITING';
    case 'NOT_IN_ROOM':
    default:
      return 'JOIN';
  }
};
