import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationRequest {
  mensagemId: string;
  conteudoMensagem: string;
}

export interface NotificationResponse {
  mensagemId: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  private apiUrl = 'http://localhost:3000/api/notificar';

  constructor(private http: HttpClient) {}

  sendNotification(
    payload: NotificationRequest
  ): Observable<NotificationResponse> {
    return this.http.post<NotificationResponse>(this.apiUrl, payload);
  }

  getNotificationStatus(mensagemId: string): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(
      `${this.apiUrl}/status/${mensagemId}`
    );
  }
}
