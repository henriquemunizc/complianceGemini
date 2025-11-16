import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';

/**
 * Service para consulta de logs de auditoria.
 * Apenas usuários ADMIN podem acessar.
 */
@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly API_URL = '/api/v1/audit';
  private http = inject(HttpClient);

  /**
   * Busca histórico de auditoria de uma entidade.
   */
  buscarPorEntidade(entidade: string, entidadeId: number): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.API_URL}/${entidade}/${entidadeId}`);
  }

  /**
   * Busca ações de um usuário.
   */
  buscarPorUsuario(email: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.API_URL}/usuario/${email}`);
  }

  /**
   * Busca logs por período.
   */
  buscarPorPeriodo(inicio: Date, fim: Date): Observable<AuditLog[]> {
    const params = new HttpParams()
      .set('inicio', inicio.toISOString())
      .set('fim', fim.toISOString());

    return this.http.get<AuditLog[]>(`${this.API_URL}/periodo`, { params });
  }
}
