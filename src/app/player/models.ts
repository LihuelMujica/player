export type PlayerState =
  | 'NOT_IN_ROOM'
  | 'IN_LOBBY'
  | 'ASIGNANDO_ROL'
  | 'RESPONDIENDO'
  | 'RESPUESTA_ENVIADA'
  | 'VOTANDO'
  | 'VOTO_ENVIADO'
  | 'DEBATIENDO'
  | 'ESPERANDO_SIGUIENTE_RONDA'
  | 'GANADOR'
  | 'PERDEDOR'
  | 'EMPATE';

export type ConnectionState = 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface PlayerQuestion {
  id: number;
  pregunta: string;
  extra_data?: {
    impostor?: boolean;
  };
}

export interface VoteOption {
  playerId: string;
  playerName: string;
}

export interface PlayerSnapshotPayload {
  playerId: string;
  name: string;
  avatarId: number;
  isImpostor: boolean;
  state: PlayerState;
  connectionState: ConnectionState | null;
  currentQuestion: PlayerQuestion | null;
  voteOptions?: VoteOption[];
}

export interface PlayerSnapshotEvent {
  type: 'PLAYER_SNAPSHOT';
  metadata: {
    cycleNumber: number;
    gameId: string;
    playerId: string | null;
    roomCode: string;
  };
  payload: PlayerSnapshotPayload;
}

export type PlayerEvent = PlayerSnapshotEvent | { type: string; payload?: unknown };

export type PlayerPhase =
  | 'JOIN'
  | 'LOBBY'
  | 'ROLE_ASSIGNMENT'
  | 'ANSWER'
  | 'VOTE'
  | 'RESULTS'
  | 'WAITING';

export interface PlayerViewModel {
  phase: PlayerPhase;
  roomCode: string | null;
  playerId: string | null;
  name: string;
  avatarId: number | null;
  state: PlayerState | null;
  connectionState: ConnectionState;
  currentQuestion: PlayerQuestion | null;
  isImpostor: boolean | null;
}
