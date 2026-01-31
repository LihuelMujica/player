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
  private readonly baseUrl = 'http://localhost:8080';

  constructor(private readonly http: HttpClient) {}

  joinRoom(payload: JoinRoomRequest): Observable<JoinRoomResponse> {
    return this.http.post<JoinRoomResponse>(`${this.baseUrl}/room/join`, payload, {
      headers: {
        accept: '*/*',
      },
    });
  }

  submitAnswer(roomCode: string, playerId: string, answer: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/player/answer`, {
      roomCode,
      playerId,
      answer,
    });
  }

  vote(roomCode: string, playerId: string, voteFor: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/player/vote`, {
      roomCode,
      playerId,
      voteFor,
    });
  }
}
