import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface JoinRoomRequest {
  roomCode: string;
  name: string;
  avatarId: number;
}

interface JoinRoomResponse {
  playerId: string;
}

@Injectable({ providedIn: 'root' })
export class PlayerApiService {
  private readonly baseUrl = 'http://18.222.254.35:8080';

  constructor(private readonly http: HttpClient) {}

  joinRoom(payload: JoinRoomRequest): Observable<JoinRoomResponse> {
    return this.http.post<JoinRoomResponse>(`${this.baseUrl}/room/join`, payload, {
      headers: {
        accept: '*/*',
      },
    });
  }

  submitAnswer(roomCode: string, playerId: string, answerText: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/game/${roomCode}/send-answer`, {
      roomCode,
      playerId,
      answerText,
    });
  }

  vote(roomCode: string, playerId: string, votedPlayerId: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/game/${roomCode}/send-votes`, {
      roomCode,
      playerId,
      votedPlayerId,
    });
  }
}
