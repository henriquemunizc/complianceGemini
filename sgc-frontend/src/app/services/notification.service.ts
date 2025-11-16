import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { Notificacao, NotificacaoCreateDTO } from '../models/notificacao.model';

/**
 * Service para gerenciamento de notificações.
 * Inclui polling automático a cada 30 segundos.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly API_URL = '/api/v1/notificacoes';
  private http = inject(HttpClient);

  /**
   * Cria uma nova notificação.
   */
  criar(dto: NotificacaoCreateDTO): Observable<Notificacao> {
    return this.http.post<Notificacao>(this.API_URL, dto);
  }

  /**
   * Lista todas as notificações do usuário logado.
   */
  getNotificacoes(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(this.API_URL);
  }

  /**
   * Lista notificações não lidas.
   */
  getNaoLidas(): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.API_URL}/nao-lidas`);
  }

  /**
   * Retorna contador de notificações não lidas.
   */
  getCountNaoLidas(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/nao-lidas/count`);
  }

  /**
   * Marca uma notificação como lida.
   */
  marcarComoLida(id: number): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${id}/marcar-lida`, {});
  }

  /**
   * Marca todas as notificações como lidas.
   */
  marcarTodasLidas(): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/marcar-todas-lidas`, {});
  }

  /**
   * Polling de notificações a cada 30 segundos.
   * Retorna um Observable que emite notificações automaticamente.
   */
  startPolling(intervalMs: number = 30000): Observable<Notificacao[]> {
    return interval(intervalMs).pipe(
      startWith(0), // Emite imediatamente no subscribe
      switchMap(() => this.getNotificacoes())
    );
  }

  /**
   * Polling do contador de não lidas a cada 30 segundos.
   */
  startCountPolling(intervalMs: number = 30000): Observable<number> {
    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => this.getCountNaoLidas())
    );
  }
}
