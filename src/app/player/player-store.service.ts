import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ConnectionState,
  PlayerEvent,
  PlayerPhase,
  PlayerQuestion,
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
  state: null,
  connectionState: 'DISCONNECTED',
  currentQuestion: null,
  isImpostor: null,
  voteOptions: [],
};

@Injectable({ providedIn: 'root' })
export class PlayerStoreService {
  private readonly subject = new BehaviorSubject<PlayerViewModel>(initialViewModel);
  readonly vm$ = this.subject.asObservable();

  get snapshot(): PlayerViewModel {
    return this.subject.getValue();
  }

  setSnapshot(payload: PlayerSnapshotPayload): void {
    const nextState: PlayerViewModel = {
      ...this.snapshot,
      phase: phaseFromState(payload.state),
      playerId: payload.playerId,
      name: payload.name,
      avatarId: payload.avatarId,
      state: payload.state,
      connectionState: payload.connectionState ?? 'CONNECTED',
      currentQuestion: payload.currentQuestion,
      isImpostor: payload.isImpostor ?? null,
      voteOptions: payload.voteOptions ?? this.snapshot.voteOptions ?? [],
    };
    this.subject.next(nextState);
  }

  applyEvent(event: PlayerEvent): void {
    // eslint-disable-next-line no-console
    console.info('[PlayerStore] applyEvent', event);
    if (event.type === 'PLAYER_SNAPSHOT') {
      const payload = (event as { payload: PlayerSnapshotPayload }).payload;
      if (payload) {
        // eslint-disable-next-line no-console
        console.info('[PlayerStore] PLAYER_SNAPSHOT payload', payload);
        this.setSnapshot(payload);
      }
      return;
    }

    if (event.type === 'ROLES_ASIGNADOS') {
      const payload = (event as {
        payload?: {
          playerId?: string;
          name?: string;
          avatarId?: number;
          state?: PlayerState;
          connectionState?: ConnectionState | null;
          currentQuestion?: PlayerQuestion | null;
          isImpostor?: boolean;
          impostor?: boolean;
        };
      }).payload;
      if (payload) {
        const nextState: PlayerViewModel = {
          ...this.snapshot,
          phase: phaseFromState(payload.state ?? this.snapshot.state),
          playerId: payload.playerId ?? this.snapshot.playerId,
          name: payload.name ?? this.snapshot.name,
          avatarId: payload.avatarId ?? this.snapshot.avatarId,
          state: payload.state ?? this.snapshot.state,
          connectionState: payload.connectionState ?? this.snapshot.connectionState,
          currentQuestion: payload.currentQuestion ?? this.snapshot.currentQuestion,
          isImpostor: payload.isImpostor ?? payload.impostor ?? this.snapshot.isImpostor,
        };
        // eslint-disable-next-line no-console
        console.info('[PlayerStore] ROLES_ASIGNADOS applied', {
          event,
          nextState,
        });
        this.subject.next(nextState);
        return;
      }
    }

    if (event.type === 'PREGUNTA_ASIGNADA') {
      const payload = (event as { payload?: PlayerSnapshotPayload }).payload;
      if (payload) {
        // eslint-disable-next-line no-console
        console.info('[PlayerStore] PREGUNTA_ASIGNADA payload', payload);
        this.setSnapshot(payload);
      }
      return;
    }

    if (event.type === 'DEBATE_INICIADO') {
      // eslint-disable-next-line no-console
      console.info('[PlayerStore] DEBATE_INICIADO payload', (event as { payload?: unknown }).payload);
      const nextState: PlayerViewModel = {
        ...this.snapshot,
        phase: 'DEBATE',
        state: 'DEBATIENDO',
      };
      this.subject.next(nextState);
      return;
    }

    if (event.type === 'VOTACION_INICIADA') {
      const payload = (event as { payload?: PlayerSnapshotPayload['voteOptions'] }).payload;
      if (payload) {
        const nextState: PlayerViewModel = {
          ...this.snapshot,
          phase: 'VOTE',
          state: 'VOTANDO',
          voteOptions: payload,
        };
        this.subject.next(nextState);
        return;
      }
    }

    this.subject.next({ ...this.snapshot });
  }

  setJoinInfo(roomCode: string, playerId: string, name: string, avatarId: number): void {
    this.subject.next({
      ...this.snapshot,
      phase: 'WAITING',
      roomCode,
      playerId,
      name,
      avatarId,
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
      return 'ROLE_ASSIGNMENT';
    case 'DEBATIENDO':
      return 'DEBATE';
    case 'ESPERANDO_SIGUIENTE_RONDA':
      return 'WAITING';
    case 'NOT_IN_ROOM':
    default:
      return 'JOIN';
  }
};
